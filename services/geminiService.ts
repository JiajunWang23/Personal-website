import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT, RESUME_DATA } from '../constants';
import { Message } from '../types';

let client: GoogleGenAI | null = null;

// Initialize client only if API key is present
if (process.env.API_KEY) {
  client = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

/**
 * Local fallback logic for when the AI service is unreachable (e.g. restricted regions like China).
 * Provides basic answers based on resume data using keyword matching.
 * Supports both English and Chinese keywords.
 */
const getFallbackResponse = (query: string): string => {
  const q = query.toLowerCase();
  
  // Contact / 联系方式
  if (q.includes('contact') || q.includes('email') || q.includes('phone') || q.includes('linkedin') || 
      q.includes('联系') || q.includes('邮箱') || q.includes('电话')) {
    return `You can reach Jiajun at ${RESUME_DATA.contact.email} or ${RESUME_DATA.contact.phone}. Check out his LinkedIn: ${RESUME_DATA.contact.linkedin}\n\n(您可以发送邮件至 ${RESUME_DATA.contact.email} 或拨打 ${RESUME_DATA.contact.phone} 联系我。)`;
  }
  
  // Education / 教育背景
  if (q.includes('education') || q.includes('school') || q.includes('university') || q.includes('degree') || 
      q.includes('gpa') || q.includes('教育') || q.includes('学校') || q.includes('大学') || q.includes('学历')) {
    return `Jiajun studies at ${RESUME_DATA.education.institution} (${RESUME_DATA.education.period}), pursuing a ${RESUME_DATA.education.degree} with a GPA of ${RESUME_DATA.education.gpa}.\n\n(我就读于 ${RESUME_DATA.education.institution}，主修 ${RESUME_DATA.education.degree}。)`;
  }
  
  // Experience / 工作经历
  if (q.includes('experience') || q.includes('work') || q.includes('job') || q.includes('intern') || 
      q.includes('company') || q.includes('经历') || q.includes('工作') || q.includes('实习')) {
    const companies = RESUME_DATA.experience.map(e => e.company).join(', ');
    return `Jiajun has professional experience at: ${companies}. For example, at AWS, he worked on distributed systems.\n\n(我曾在 ${companies} 实习，拥有丰富的软件工程经验。)`;
  }

  // Projects / 项目经验
  if (q.includes('project') || q.includes('app') || q.includes('dashboard') || q.includes('web') || 
      q.includes('项目') || q.includes('作品')) {
    const projects = RESUME_DATA.projects.map(p => p.title).join(', ');
    return `Some of his key projects include: ${projects}. Feel free to ask about specific tech stacks!\n\n(我的主要项目包括：${projects}。)`;
  }

  // Skills / 技能
  if (q.includes('skill') || q.includes('tech') || q.includes('language') || q.includes('tool') || 
      q.includes('java') || q.includes('python') || q.includes('react') || q.includes('技能') || q.includes('技术')) {
    return `Technical Skills:\nLanguages: ${RESUME_DATA.skills.languages.join(', ')}\nFrameworks: ${RESUME_DATA.skills.frameworks.join(', ')}\n\n(我熟悉的编程语言包括：${RESUME_DATA.skills.languages.join(', ')}。)`;
  }

  // Greeting
  if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('你好')) {
    return "Hello! I am Jiajun's virtual assistant. How can I help you today?\n\n(您好！我是 Jiajun 的虚拟助手，有什么可以帮您？)";
  }

  // Default fallback
  return "I am currently operating in Offline Mode (network restricted). I can tell you about Jiajun's Education, Experience, Projects, and Skills.\n\n(由于网络原因，我现在处于离线模式。我可以为您介绍我的教育背景、工作经历、项目经验和技能。)";
};

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string
): Promise<string> => {
  // 1. If no client (no API key), use fallback immediately
  if (!client) {
    return getFallbackResponse(newMessage);
  }

  try {
    // 2. Attempt to call Gemini API with a timeout
    // In regions where Google is blocked (like China), the request might hang.
    // We enforce a 5-second timeout to switch to fallback quickly for better UX.
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Request timed out")), 5000)
    );

    const apiPromise = client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: newMessage, // In a real app with history, we'd format this properly
      config: {
        systemInstruction: SYSTEM_PROMPT,
      }
    });

    // Race the API call against the timeout
    const response = await Promise.race([apiPromise, timeoutPromise]) as GenerateContentResponse;

    return response.text || getFallbackResponse(newMessage);

  } catch (error) {
    // 3. If API fails (timeout, network error, or 403/500), use fallback
    console.warn("Gemini API unavailable, switching to offline mode:", error);
    return getFallbackResponse(newMessage);
  }
};