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
Nhiệm vụ của bạn là tư vấn và gợi ý tối đa 3 chiếc xe phù hợp nhất từ danh sách đội xe có sẵn của chúng tôi dựa trên yêu cầu của khách hàng.

Dưới đây là danh sách xe đang sẵn sàng phục vụ dạng JSON:
${JSON.stringify(fleetInfo, null, 2)}

YÊU CẦU TRẢ LỜI:
1. Trả lời bằng tiếng Việt lịch sự, ngắn gọn và tự nhiên (khoảng 3-5 câu).
2. Nêu rõ lý do tại sao những chiếc xe đó phù hợp với nhu cầu của họ.
3. Bắt buộc phải chèn danh sách ID của các xe được gợi ý ở cuối câu trả lời theo đúng định dạng chính xác sau để hệ thống tự động vẽ thẻ xe lên màn hình:
RECOMMENDED_IDS: [ID_1, ID_2, ID_3]
(Ví dụ: RECOMMENDED_IDS: [60d21b4667d0d8992e610c85, 60d21b4667d0d8992e610c86])`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nYêu cầu của khách hàng: "${query}"` }] }]
      });

      const responseText = result.response.text();
      
      // Parse recommended IDs
      const match = responseText.match(/RECOMMENDED_IDS:\s*\[([^\]]+)\]/);
      let recommendedCarIds = [];
      let cleanText = responseText.replace(/RECOMMENDED_IDS:\s*\[([^\]]+)\]/, '').trim();

      if (match && match[1]) {
        recommendedCarIds = match[1].split(',')
          .map(id => id.trim().replace(/['"]/g, ''))
          .filter(id => id.length === 24);
      }

      const recommendedCars = await Car.find({ _id: { $in: recommendedCarIds }, available: true });

      if (recommendedCars.length > 0) {
        return {
          recommendation: cleanText,
          recommendedCars
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

  if (hasKeywords(['điện', 'tesla', 'vinfast', 'vf', 'auto', 'tự động'])) {
    matchedCars = allCars.filter(c => ['Tesla', 'VinFast'].includes(c.brand));
    responseMessage = "Tôi gợi ý cho bạn các dòng xe điện thông minh, sang trọng và bảo vệ môi trường hàng đầu tại VCar. Xe điện sở hữu gia tốc tức thì và nhiều công nghệ lái tự động hiện đại:";
  } else if (hasKeywords(['gia đình', '7 chỗ', 'đông người', 'du lịch', 'dã ngoại', 'camping', 'rộng'])) {
    matchedCars = allCars.filter(c => ['Kia', 'Toyota', 'Mitsubishi', 'Ford', 'Hyundai', 'Land Rover'].includes(c.brand) && 
      (c.description.includes('7 chỗ') || c.description.includes('gia đình') || c.description.includes('MPV') || c.description.includes('SUV') || c.name.includes('Carnival') || c.name.includes('Fortuner') || c.name.includes('Xpander')));
    responseMessage = "Đối với nhu cầu đi đông người, dã ngoại gia đình, bạn nên chọn các dòng SUV/MPV 7 chỗ gầm cao rộng rãi, êm ái và khoang hành lý lớn sau đây:";
  } else if (hasKeywords(['thể thao', 'sport', 'tốc độ', 'nhanh', 'mạnh', 'phóng', 'mui trần', 'đua'])) {
    matchedCars = allCars.filter(c => ['Porsche', 'Ford', 'Chevrolet'].includes(c.brand) || c.name.includes('GT') || c.name.includes('Convertible') || c.name.includes('Camaro') || c.name.includes('911'));
    responseMessage = "Dành cho những tín đồ đam mê tốc độ và muốn trải nghiệm cảm giác phấn khích sau vô lăng, đây là các siêu phẩm thể thao cơ bắp mạnh mẽ nhất đội xe của chúng tôi:";
  } else if (hasKeywords(['sang trọng', 'vip', 'sự kiện', 'đám cưới', 'gặp khách', 'đẳng cấp', 'lịch lãm', 'mẹc', 'bmw', 'audi', 'lexus'])) {
    matchedCars = allCars.filter(c => ['Mercedes-Benz', 'BMW', 'Audi', 'Lexus', 'Land Rover'].includes(c.brand) || c.name.includes('S450') || c.name.includes('Vogue') || c.name.includes('RX'));
    responseMessage = "Để phục vụ các sự kiện quan trọng, đón tiếp đối tác hoặc làm xe hoa đám cưới lịch lãm, những chiếc sedan và SUV siêu sang này chắc chắn sẽ khẳng định vị thế của bạn:";
  } else {
    // Default suggestion
    matchedCars = allCars.slice(0, 3);
    responseMessage = "Dựa trên yêu cầu của bạn, VCar xin đề xuất một số mẫu xe cao cấp đang được ưa chuộng nhất tuần này với trải nghiệm lái tuyệt vời:";
  }

  const recommendedCars = matchedCars.slice(0, 3);

  return {
    recommendation: responseMessage,
    recommendedCars
  };
};
