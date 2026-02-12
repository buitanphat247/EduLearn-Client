import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cache FAQ data - revalidate every hour
export const revalidate = 3600;

interface FAQItem {
  id: string | number;
  category: string;
  question: string;
  answer: string;
}

function getFAQData(): FAQItem[] {
  try {
    // public/ được copy vào standalone build khi deploy prod; app/ thì không
    const publicPath = path.join(process.cwd(), 'public', 'faq', 'docs', 'README.md');
    const appPath = path.join(process.cwd(), 'app/(root)/faq/docs/README.md');
    const filePath = fs.existsSync(publicPath) ? publicPath : appPath;
    
    if (!fs.existsSync(filePath)) {
      console.warn('FAQ docs not found at:', filePath);
      return [];
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    const lines = fileContent.split('\n');
    const faqs: FAQItem[] = [];
    let currentCategory = '';
    let currentQuestion = '';
    let currentAnswer = '';
    let idCounter = 1;

    const pushCurrentFAQ = () => {
      // Only push if we have a category, question, and answer (or allow empty answer)
      if (currentCategory && currentQuestion) {
        faqs.push({
          id: idCounter++,
          category: currentCategory.toLowerCase(),
          question: currentQuestion,
          answer: currentAnswer.trim(),
        });
        currentAnswer = '';
      }
    };

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (line.startsWith('# ')) {
        pushCurrentFAQ();
        currentCategory = line.replace('# ', '').trim();
        currentQuestion = '';
        currentAnswer = '';
      } else if (line.startsWith('## ')) {
        pushCurrentFAQ();
        currentQuestion = line.replace('## ', '').trim();
        currentAnswer = '';
      } else if (trimmedLine !== '') {
        if (currentQuestion) {
          // Add space for joined lines, but respect newlines if we wanted them (simplified here)
          currentAnswer += (currentAnswer ? '\n' : '') + trimmedLine;
        }
      }
    });
    
    pushCurrentFAQ(); // Push the last item

    return faqs;
  } catch (error) {
    console.error('Error reading FAQ data:', error);
    return [];
  }
}

export async function GET() {
  try {
    const faqData = getFAQData();
    return NextResponse.json({ status: true, data: faqData });
  } catch (error) {
    console.error('Error fetching FAQ data:', error);
    return NextResponse.json(
      { status: false, message: 'Không thể tải dữ liệu FAQ', data: [] },
      { status: 500 }
    );
  }
}
