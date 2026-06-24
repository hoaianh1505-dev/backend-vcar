import { GoogleGenerativeAI } from '@google/generative-ai';
import Car from '../models/Car.js';

/**
 * Generates car recommendations based on user query
 * @param {string} query User request
 * @returns {Promise<Object>} Recommendation text and list of recommended car objects
 */
export const getRecommendation = async (query) => {
  const allCars = await Car.find({ available: true });
  
  if (allCars.length === 0) {
    return {
      recommendation: "Rất tiếc, hiện tại tất cả các xe trong hệ thống của chúng tôi đều đã được thuê hoặc đang bảo trì. Vui lòng quay lại sau!",
      recommendedCars: []
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.startsWith('AIzaSy')) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const fleetInfo = allCars.map(c => ({
        id: c._id.toString(),
        name: c.name,
        brand: c.brand,
        year: c.year,
        pricePerDay: c.pricePerDay,
        description: c.description,
        location: c.location
      }));

      const systemPrompt = `Bạn là trợ lý AI chuyên nghiệp của dịch vụ thuê xe tự lái hạng sang VCar.
Nhiệm vụ của bạn là tư vấn và gợi ý duy nhất 1 chiếc xe phù hợp nhất từ danh sách đội xe có sẵn của chúng tôi dựa trên yêu cầu của khách hàng.

Dưới đây là danh sách xe đang sẵn sàng phục vụ dạng JSON:
${JSON.stringify(fleetInfo, null, 2)}

YÊU CẦU TRẢ LỜI:
1. Nếu khách hàng hỏi các câu hỏi không liên quan đến việc thuê xe, tư vấn xe, xe cộ hoặc dịch vụ VCar (ví dụ: hỏi về lập trình, nấu ăn, thời tiết, toán học, kiến thức chung khác...), bạn BẮT BUỘC phải trả lời chính xác là: "Xin lỗi, tôi không thể trả lời câu hỏi ngoài phạm vi tư vấn thuê xe của VCar." và không chèn RECOMMENDED_IDS.
2. Trả lời bằng tiếng Việt lịch sự, ngắn gọn và tự nhiên (khoảng 2-3 câu).
3. Nêu rõ lý do tại sao chiếc xe duy nhất này phù hợp với nhu cầu của họ.
4. Bắt buộc phải chèn ID của chiếc xe được gợi ý ở cuối câu trả lời theo đúng định dạng chính xác sau để hệ thống tự động vẽ thẻ xe lên màn hình:
RECOMMENDED_IDS: [ID]
(Ví dụ: RECOMMENDED_IDS: [60d21b4667d0d8992e610c85])`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nYêu cầu của khách hàng: "${query}"` }] }]
      });

      const responseText = result.response.text();
      
      // Check if AI refused to answer
      if (responseText.includes("không thể trả lời câu hỏi ngoài phạm vi")) {
        return {
          recommendation: "Xin lỗi, tôi không thể trả lời câu hỏi ngoài phạm vi tư vấn thuê xe của VCar.",
          recommendedCars: []
        };
      }

      // Parse recommended IDs
      const match = responseText.match(/RECOMMENDED_IDS:\s*\[([^\]]+)\]/);
      let recommendedCarIds = [];
      let cleanText = responseText.replace(/RECOMMENDED_IDS:\s*\[([^\]]+)\]/, '').trim();

      if (match && match[1]) {
        recommendedCarIds = match[1].split(',')
          .map(id => id.trim().replace(/['"]/g, ''))
          .filter(id => id.length === 24)
          .slice(0, 1); // Only allow 1 car
      }

      const recommendedCars = await Car.find({ _id: { $in: recommendedCarIds }, available: true });

      if (recommendedCars.length > 0) {
        return {
          recommendation: cleanText,
          recommendedCars: recommendedCars.slice(0, 1)
        };
      }
    } catch (error) {
      console.error('Gemini API Error, falling back to NLP Matcher:', error.message);
    }
  }

  // Fallback Rule-Based NLP Matcher
  const lowercaseQuery = query.toLowerCase();
  let matchedCars = [];
  let responseMessage = "";

  const hasKeywords = (keywords) => keywords.some(k => lowercaseQuery.includes(k));

  // Check for unrelated questions
  const carRelatedKeywords = [
    'điện', 'tesla', 'vinfast', 'vf', 'auto', 'tự động',
    'gia đình', '7 chỗ', 'đông người', 'du lịch', 'dã ngoại', 'camping', 'rộng',
    'thể thao', 'sport', 'tốc độ', 'nhanh', 'mạnh', 'phóng', 'mui trần', 'đua',
    'sang trọng', 'vip', 'sự kiện', 'đám cưới', 'gặp khách', 'đẳng cấp', 'lịch lãm', 'mẹc', 'bmw', 'audi', 'lexus',
    'thuê', 'mướn', 'xe', 'oto', 'ôtô', 'car', 'rent', 'tìm', 'chỗ', 'hỏi', 'giá', 'tiền', 'nghỉ'
  ];

  const greetings = ['xin chào', 'chào', 'hello', 'hi', 'chào bạn', 'tư vấn', 'giúp'];

  const isRelated = hasKeywords(carRelatedKeywords) || hasKeywords(greetings);

  if (!isRelated) {
    return {
      recommendation: "Xin lỗi, tôi không thể trả lời câu hỏi ngoài phạm vi tư vấn thuê xe của VCar.",
      recommendedCars: []
    };
  }

  if (hasKeywords(['điện', 'tesla', 'vinfast', 'vf', 'auto', 'tự động'])) {
    matchedCars = allCars.filter(c => ['Tesla', 'VinFast'].includes(c.brand));
    responseMessage = "Tôi gợi ý cho bạn chiếc xe điện thông minh, sang trọng và bảo vệ môi trường hàng đầu tại VCar:";
  } else if (hasKeywords(['gia đình', '7 chỗ', 'đông người', 'du lịch', 'dã ngoại', 'camping', 'rộng'])) {
    matchedCars = allCars.filter(c => ['Kia', 'Toyota', 'Mitsubishi', 'Ford', 'Hyundai', 'Land Rover'].includes(c.brand) && 
      (c.description.includes('7 chỗ') || c.description.includes('gia đình') || c.description.includes('MPV') || c.description.includes('SUV') || c.name.includes('Carnival') || c.name.includes('Fortuner') || c.name.includes('Xpander')));
    responseMessage = "Đối với nhu cầu đi đông người hoặc dã ngoại gia đình, bạn nên chọn chiếc xe gầm cao rộng rãi, êm ái và khoang hành lý lớn sau đây:";
  } else if (hasKeywords(['thể thao', 'sport', 'tốc độ', 'nhanh', 'mạnh', 'phóng', 'mui trần', 'đua'])) {
    matchedCars = allCars.filter(c => ['Porsche', 'Ford', 'Chevrolet'].includes(c.brand) || c.name.includes('GT') || c.name.includes('Convertible') || c.name.includes('Camaro') || c.name.includes('911'));
    responseMessage = "Dành cho trải nghiệm phấn khích sau vô lăng với tốc độ mạnh mẽ, đây là mẫu xe thể thao cơ bắp tuyệt vời dành cho bạn:";
  } else if (hasKeywords(['sang trọng', 'vip', 'sự kiện', 'đám cưới', 'gặp khách', 'đẳng cấp', 'lịch lãm', 'mẹc', 'bmw', 'audi', 'lexus'])) {
    matchedCars = allCars.filter(c => ['Mercedes-Benz', 'BMW', 'Audi', 'Lexus', 'Land Rover'].includes(c.brand) || c.name.includes('S450') || c.name.includes('Vogue') || c.name.includes('RX'));
    responseMessage = "Để phục vụ các sự kiện quan trọng hoặc làm xe hoa đám cưới lịch lãm, chiếc xe sang trọng này chắc chắn sẽ khẳng định vị thế của bạn:";
  } else {
    // Default suggestion
    matchedCars = allCars;
    responseMessage = "VCar xin đề xuất mẫu xe cao cấp đang được ưa chuộng nhất tuần này với trải nghiệm lái tuyệt vời dành cho bạn:";
  }

  const recommendedCars = matchedCars.slice(0, 1); // Suggest exactly 1 car

  return {
    recommendation: responseMessage,
    recommendedCars
  };
};
