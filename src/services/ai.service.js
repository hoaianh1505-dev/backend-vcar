import { GoogleGenerativeAI } from '@google/generative-ai';
import Car from '../models/Car.js';

/**
 * Generates car recommendations based on user query using Gemini API
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
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in the environment variables');
  }

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

  return {
    recommendation: cleanText,
    recommendedCars
  };
};
