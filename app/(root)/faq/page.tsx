import FAQClient from './FAQClient';

export const metadata = {
  title: 'Câu hỏi thường gặp - Thư Viện Số',
  description: 'Giải đáp các thắc mắc về tài khoản, khóa học và thanh toán trên Thư Viện Số.',
};

interface FAQItem {
  id: string | number;
  category: string;
  question: string;
  answer: string;
}

async function getFAQData(): Promise<FAQItem[]> {
  try {
    // Import fs and path for server-side file reading
    const fs = await import('fs');
    const path = await import('path');
    
    // public/ được copy vào standalone build khi deploy prod; app/ thì không
    const publicPath = path.join(process.cwd(), 'public', 'faq', 'docs', 'faq-content.md');
    const appPath = path.join(process.cwd(), 'app/(root)/faq/docs/faq-content.md');
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

export default async function FAQPage() {
  const faqData = await getFAQData();
  return <FAQClient faqData={faqData} />;
}
