import fs from 'fs';
import path from 'path';
import { 
  LeftOutlined, 
  RightOutlined
} from '@ant-design/icons';
import GuideSidebar from '@/app/(root)/guide/GuideSidebar';
import GuideContent from '@/app/(root)/guide/GuideContent';
import PrefetchLink from '@/app/components/common/PrefetchLink';

// Load menu configuration
const getMenu = () => {
  try {
    const menuPath = path.join(process.cwd(), 'app/(root)/innovation/docs/menu.json');
    const menuContent = fs.readFileSync(menuPath, 'utf8');
    return JSON.parse(menuContent);
  } catch (error) {
    console.error('Error loading menu:', error);
    return [];
  }
};

// Load markdown content
const getDocContent = (slug: string) => {
  try {
    const docPath = path.join(process.cwd(), `app/(root)/innovation/docs/${slug}.md`);
    if (fs.existsSync(docPath)) {
      return fs.readFileSync(docPath, 'utf8');
    }
    return `# Không tìm thấy nội dung\n\nNội dung bạn đang tìm kiếm ("${slug}") hiện không có sẵn.`;
  } catch (error) {
    return `# Lỗi tải tài liệu\n\nĐã xảy ra lỗi khi tải tài liệu này.`;
  }
};

export const metadata = {
  title: 'Công nghệ & Đổi mới - Thư Viện Số',
  description: 'Khám phá các công nghệ tiên tiến áp dụng trong giáo dục tại Thư Viện Số.',
};

interface InnovationPageProps {
  searchParams: Promise<{ doc?: string }>;
}

export default async function InnovationPage(props: InnovationPageProps) {
  const searchParams = await props.searchParams;
  const currentSlug = searchParams?.doc || 'overview';
  const content = getDocContent(currentSlug);
  const menuData = getMenu();

  // Flatten menu to find prev/next
  const flatItems: any[] = [];
  menuData.forEach((section: any) => {
      if(section.items) {
          section.items.forEach((item: any) => flatItems.push(item));
      }
  });

  const currentIndex = flatItems.findIndex(item => item.slug === currentSlug);
  const prevDoc = currentIndex > 0 ? flatItems[currentIndex - 1] : null;
  const nextDoc = currentIndex !== -1 && currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 pt-20 pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 relative">
          
          {/* Sidebar */}
          <div className="hidden lg:block w-72 shrink-0 pr-4">
             {/* Pass baseUrl to direct links to /innovation instead of /guide */}
             <GuideSidebar menu={menuData} currentSlug={currentSlug} baseUrl="/innovation" />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 md:p-10 border border-slate-200 dark:border-slate-700/50 shadow-sm min-h-[500px]">
                <GuideContent content={content} />
            </div>

            {/* Navigation Footer */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                {prevDoc ? (
                   <PrefetchLink href={`/innovation?doc=${prevDoc.slug}`} className="flex-1 group">
                      <div className="border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-white dark:bg-[#1e293b]">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                              <LeftOutlined /> Trước
                          </div>
                          <div className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {prevDoc.title}
                          </div>
                      </div>
                   </PrefetchLink>
                ) : <div className="flex-1"></div>}

                {nextDoc ? (
                   <PrefetchLink href={`/innovation?doc=${nextDoc.slug}`} className="flex-1 group text-right">
                      <div className="border border-slate-200 dark:border-slate-700/50 rounded-2xl p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors bg-white dark:bg-[#1e293b]">
                          <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1 justify-end group-hover:text-blue-500 transition-colors">
                              Tiếp theo <RightOutlined />
                          </div>
                          <div className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {nextDoc.title}
                          </div>
                      </div>
                   </PrefetchLink>
                ) : <div className="flex-1"></div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
