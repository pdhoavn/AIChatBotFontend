// src/components/Programs.jsx
import React, { useState } from 'react';
import { Code, Smartphone, Database, Palette, TrendingUp, Globe, X } from 'lucide-react';

const programs = [
  {
    icon: Code,
    title: 'Kỹ thuật phần mềm',
    description: 'Đào tạo kỹ sư phần mềm chuyên nghiệp với khả năng phát triển ứng dụng quy mô lớn',
    duration: '4 năm',
    opportunities: 'Software Engineer, Full-stack Developer, DevOps Engineer',
    gradient: 'from-blue-500 to-blue-600',
    details: {
      intro:
        'Ngành Kỹ thuật phần mềm đào tạo bạn trở thành kỹ sư phần mềm có khả năng thiết kế, xây dựng và vận hành các hệ thống phần mềm từ ứng dụng web, mobile đến hệ thống doanh nghiệp quy mô lớn.',
      highlights: [
        'Chương trình học cập nhật theo xu hướng công nghệ mới: Cloud, Microservices, DevOps, Agile/Scrum.',
        'Thực hành nhiều với các dự án thật: website, ứng dụng di động, hệ thống quản lý cho doanh nghiệp.',
        'Giảng viên có kinh nghiệm thực tế, nhiều hoạt động dự án, hackathon, CLB lập trình.',
      ],
      suitableFor: [
        'Yêu thích logic, lập trình và giải quyết vấn đề.',
        'Thích xây sản phẩm công nghệ có thể dùng được ngay trong thực tế.',
        'Muốn theo các vị trí Software Engineer, Full-stack Developer, DevOps Engineer,…',
      ],
      coreSubjects: [
        'Lập trình hướng đối tượng, Cơ sở dữ liệu, Cấu trúc dữ liệu & Giải thuật',
        'Phát triển Web, Phát triển ứng dụng di động',
        'Thiết kế kiến trúc phần mềm, Kiểm thử & đảm bảo chất lượng phần mềm',
      ],
      outcomes:
        'Sau khi tốt nghiệp, bạn có thể tham gia phát triển và vận hành hệ thống phần mềm tại các công ty công nghệ, startup hoặc tự xây dựng sản phẩm riêng.',
    },
  },
  {
    icon: Smartphone,
    title: 'Thiết kế đồ họa',
    description: 'Sáng tạo và thiết kế các sản phẩm đồ họa chuyên nghiệp cho thị trường quốc tế',
    duration: '4 năm',
    opportunities: 'UI/UX Designer, Graphic Designer, Creative Director',
    gradient: 'from-pink-500 to-pink-600',
    details: {
      intro:
        'Ngành Thiết kế đồ họa kết hợp giữa tư duy mỹ thuật và công nghệ để tạo ra các sản phẩm thiết kế ấn tượng cho thương hiệu, sản phẩm và trải nghiệm số.',
      highlights: [
        'Học vững nền tảng mỹ thuật, màu sắc, bố cục, typography.',
        'Thực hành trên các phần mềm thiết kế phổ biến: Adobe Photoshop, Illustrator, Figma, v.v.',
        'Nhiều đồ án, portfolio cá nhân hỗ trợ xin việc ngay khi còn đi học.',
      ],
      suitableFor: [
        'Yêu thích vẽ, sáng tạo, thiết kế hình ảnh, giao diện.',
        'Thích làm việc với màu sắc, bố cục, concept thương hiệu.',
        'Muốn làm UI/UX Designer, Graphic Designer, Creative Director,…',
      ],
      coreSubjects: [
        'Cơ sở mỹ thuật, Nguyên lý thiết kế',
        'Thiết kế thương hiệu, Thiết kế giao diện số (UI)',
        'Thiết kế ấn phẩm truyền thông, Motion Graphic cơ bản',
      ],
      outcomes:
        'Sinh viên có thể làm việc tại agency, công ty sản xuất nội dung, phòng marketing, startup sản phẩm số hoặc làm freelancer thiết kế.',
    },
  },
  {
    icon: Database,
    title: 'Trí tuệ nhân tạo',
    description: 'Nghiên cứu và phát triển các giải pháp AI, Machine Learning cho doanh nghiệp',
    duration: '4 năm',
    opportunities: 'AI Engineer, Data Scientist, ML Researcher',
    gradient: 'from-green-500 to-green-600',
    details: {
      intro:
        'Ngành Trí tuệ nhân tạo tập trung vào các kỹ thuật Machine Learning, Deep Learning và xử lý dữ liệu lớn để xây dựng hệ thống thông minh cho doanh nghiệp và sản phẩm số.',
      highlights: [
        'Trang bị nền tảng vững về toán cho AI: Đại số tuyến tính, Xác suất – Thống kê, Tối ưu hoá.',
        'Luyện kỹ năng lập trình Python, thư viện Machine Learning, Deep Learning.',
        'Thực hành qua các bài toán thực tế: nhận diện hình ảnh, xử lý ngôn ngữ tự nhiên, gợi ý sản phẩm,…',
      ],
      suitableFor: [
        'Yêu thích dữ liệu, thuật toán và thích khám phá công nghệ AI.',
        'Không ngại học toán và nghiên cứu mô hình.',
        'Muốn phát triển theo hướng AI Engineer, Data Scientist, ML Researcher,…',
      ],
      coreSubjects: [
        'Nhập môn Trí tuệ nhân tạo, Machine Learning cơ bản',
        'Xử lý dữ liệu lớn, Deep Learning',
        'Ứng dụng AI trong thị giác máy tính, xử lý ngôn ngữ tự nhiên',
      ],
      outcomes:
        'Sinh viên có thể tham gia xây dựng hệ thống AI cho doanh nghiệp, startup công nghệ, trung tâm R&D hoặc tiếp tục học sâu hơn ở bậc sau đại học.',
    },
  },
  {
    icon: Globe,
    title: 'An ninh mạng',
    description: 'Chuyên gia bảo mật thông tin, bảo vệ hệ thống và dữ liệu doanh nghiệp',
    duration: '4 năm',
    opportunities: 'Security Analyst, Ethical Hacker, Security Architect',
    gradient: 'from-red-500 to-red-600',
    details: {
      intro:
        'Ngành An ninh mạng tập trung vào việc bảo vệ hệ thống thông tin, dữ liệu và hạ tầng công nghệ của tổ chức trước các cuộc tấn công mạng ngày càng phức tạp.',
      highlights: [
        'Học về quản trị mạng, hệ điều hành, kiến trúc hệ thống thông tin.',
        'Thực hành các kỹ thuật tấn công – phòng thủ, phân tích lỗ hổng bảo mật.',
        'Làm việc với các công cụ bảo mật, mô phỏng tình huống tấn công thực tế.',
      ],
      suitableFor: [
        'Thích tìm hiểu cách hệ thống hoạt động và cách “phá – phòng thủ” một cách hợp pháp.',
        'Quan tâm đến bảo mật, quyền riêng tư và an toàn thông tin.',
        'Muốn trở thành Security Analyst, Ethical Hacker, Security Engineer,…',
      ],
      coreSubjects: [
        'Mạng máy tính, Hệ điều hành',
        'An toàn thông tin, Mã hóa và ứng dụng',
        'Kiểm thử xâm nhập (Pen-testing), Điều tra số',
      ],
      outcomes:
        'Sinh viên có thể làm việc tại bộ phận an toàn thông tin của doanh nghiệp, ngân hàng, tổ chức tài chính, công ty an ninh mạng hoặc cơ quan nhà nước.',
    },
  },
  {
    icon: TrendingUp,
    title: 'Kinh doanh số',
    description: 'Kết hợp công nghệ và kinh doanh để xây dựng các mô hình kinh doanh hiện đại',
    duration: '4 năm',
    opportunities: 'Digital Marketer, Business Analyst, Product Manager',
    gradient: 'from-orange-500 to-orange-600',
    details: {
      intro:
        'Ngành Kinh doanh số giúp bạn hiểu cách vận hành doanh nghiệp trong kỷ nguyên số, biết cách ứng dụng công nghệ, dữ liệu và nền tảng số để tạo ra giá trị kinh doanh.',
      highlights: [
        'Học cả kiến thức nền tảng kinh tế – quản trị, lẫn công cụ digital marketing và phân tích dữ liệu.',
        'Thực hành xây dựng kế hoạch kinh doanh, chiến lược marketing, vận hành kênh online.',
        'Làm dự án với doanh nghiệp, startup, sàn thương mại điện tử.',
      ],
      suitableFor: [
        'Yêu thích kinh doanh, marketing và công nghệ.',
        'Muốn làm việc trong môi trường startup, thương mại điện tử, fintech,…',
        'Định hướng các vị trí Digital Marketer, Business Analyst, Product Manager,…',
      ],
      coreSubjects: [
        'Nguyên lý marketing, Quản trị kinh doanh',
        'Digital Marketing, Thương mại điện tử',
        'Phân tích dữ liệu kinh doanh, Quản trị sản phẩm số',
      ],
      outcomes:
        'Sau khi tốt nghiệp, bạn có thể làm tại phòng marketing, kinh doanh, phát triển sản phẩm của doanh nghiệp, hoặc khởi nghiệp với mô hình kinh doanh số của riêng mình.',
    },
  },
  {
    icon: Palette,
    title: 'Thiết kế trò chơi',
    description: 'Sáng tạo và phát triển các trò chơi điện tử chất lượng cao cho thị trường toàn cầu',
    duration: '4 năm',
    opportunities: 'Game Designer, 3D Artist, Game Developer',
    gradient: 'from-purple-500 to-purple-600',
    details: {
      intro:
        'Ngành Thiết kế trò chơi kết hợp nghệ thuật, câu chuyện và công nghệ để tạo nên các sản phẩm game hấp dẫn trên nhiều nền tảng khác nhau.',
      highlights: [
        'Học về tư duy thiết kế game, xây dựng gameplay, level, hệ thống nhiệm vụ.',
        'Thực hành với các engine phổ biến như Unity, Unreal Engine (tùy chương trình).',
        'Xây dựng portfolio game cá nhân hoặc làm việc theo nhóm trong các dự án lớn.',
      ],
      suitableFor: [
        'Đam mê game và muốn bước sang phía “làm game” chứ không chỉ chơi game.',
        'Thích thiết kế nhân vật, thế giới, câu chuyện, cơ chế gameplay.',
        'Muốn làm Game Designer, 3D Artist, Game Developer,…',
      ],
      coreSubjects: [
        'Nguyên lý thiết kế game, Game art cơ bản',
        'Lập trình game, Thiết kế level & hệ thống chơi',
        'Dự án phát triển game hoàn chỉnh theo nhóm',
      ],
      outcomes:
        'Sinh viên có thể tham gia các studio game trong và ngoài nước, đội ngũ phát triển game của các công ty giải trí, hoặc xây dựng dự án game độc lập.',
    },
  },
];

function ProgramDetailModal({ program, onClose }) {
  if (!program) return null;

  const Icon = program.icon;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        {/* Header */}
        <div className={`bg-gradient-to-r ${program.gradient} p-6 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-2xl p-3">
              <Icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{program.title}</h3>
              <p className="text-white/90 text-sm">Thời gian đào tạo: {program.duration}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white rounded-full p-1 hover:bg-white/10 transition"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          <p className="text-gray-700 leading-relaxed">{program.details.intro}</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Điểm nổi bật của ngành
              </h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                {program.details.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                Phù hợp với ai?
              </h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                {program.details.suitableFor.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Một số học phần tiêu biểu
            </h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              {program.details.coreSubjects.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Cơ hội nghề nghiệp & đầu ra
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">{program.details.outcomes}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {program.opportunities.split(', ').map((op, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-gray-100 text-gray-800 text-xs font-medium"
                >
                  {op}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Programs() {
  const [activeProgram, setActiveProgram] = useState(null);

  const handleScrollToAdmissions = () => {
    const el = document.getElementById("admissions");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <section id="programs" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Các{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Ngành học
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Chương trình đào tạo đa dạng, đáp ứng nhu cầu của thị trường lao động công nghệ 4.0
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent hover:-translate-y-2"
            >
              <div className={`bg-gradient-to-br ${program.gradient} p-8 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                <program.icon className="h-12 w-12 text-white mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
                  {program.title}
                </h3>
                <div className="text-white/90 text-sm relative z-10">
                  Thời gian: {program.duration}
                </div>
              </div>

              <div className="p-8">
                <p className="text-gray-600 mb-6 leading-relaxed">{program.description}</p>

                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-900">Cơ hội nghề nghiệp:</div>
                  <div className="flex flex-wrap gap-2">
                    {program.opportunities.split(', ').map((opportunity, i) => (
                      <span
                        key={i}
                        className="inline-block bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full"
                      >
                        {opportunity}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setActiveProgram(program)}
                  className={`mt-6 w-full bg-gradient-to-r ${program.gradient} text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 group-hover:scale-105`}
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-orange-50 rounded-3xl p-12 border border-orange-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Chưa chắc chắn về ngành học?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Đội ngũ tư vấn của chúng tôi sẵn sàng hỗ trợ bạn tìm ra ngành học phù hợp nhất với đam mê
              và năng lực.
            </p>
            <button 
            onClick={handleScrollToAdmissions}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105">
              Đặt lịch tư vấn miễn phí
            </button>
          </div>
        </div>
      </div>

      <ProgramDetailModal program={activeProgram} onClose={() => setActiveProgram(null)} />
    </section>
  );
}
