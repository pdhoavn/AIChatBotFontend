import { Globe, Award, Users, TrendingUp, Briefcase, BookOpen } from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Môi trường quốc tế',
    description: 'Học tập trong môi trường đa văn hóa với giảng viên và sinh viên quốc tế',
  },
  {
    icon: Award,
    title: 'Chất lượng hàng đầu',
    description: 'Được công nhận bởi các tổ chức giáo dục uy tín trên thế giới',
  },
  {
    icon: Users,
    title: 'Học từ chuyên gia',
    description: 'Giảng viên là các chuyên gia hàng đầu từ doanh nghiệp và học viện',
  },
  {
    icon: TrendingUp,
    title: 'Phương pháp hiện đại',
    description: 'Học tập dựa trên dự án thực tế, phát triển kỹ năng toàn diện',
  },
  {
    icon: Briefcase,
    title: '100% việc làm',
    description: 'Cam kết cơ hội việc làm với mức lương khởi điểm cao',
  },
  {
    icon: BookOpen,
    title: 'Chương trình linh hoạt',
    description: 'Tự do lựa chọn thời gian và địa điểm học tập phù hợp',
  },
];

export default function WhyFPT() {
  return (
    <section id="about" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tại sao chọn{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              FPT University?
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Đại học FPT không chỉ là nơi học tập mà còn là cộng đồng phát triển toàn diện,
            mở ra cánh cửa thành công cho tương lai của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 hover:-translate-y-1"
            >
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Hệ sinh thái giáo dục toàn diện
              </h3>
              <p className="text-orange-50 text-lg leading-relaxed mb-6">
                FPT University là thành viên của Tập đoàn FPT - tập đoàn công nghệ hàng đầu Việt Nam.
                Sinh viên được học tập, thực hành và làm việc trong hệ sinh thái công nghệ lớn nhất Việt Nam.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Thực tập tại các công ty công nghệ hàng đầu</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Tham gia các dự án thực tế từ năm thứ nhất</span>
                </li>
                <li className="flex items-start">
                  <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span>Cơ hội du học và làm việc tại các quốc gia phát triển</span>
                </li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">5+</div>
                <div className="text-orange-50">Cơ sở toàn quốc</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">200+</div>
                <div className="text-orange-50">Đối tác doanh nghiệp</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-orange-50">Đối tác quốc tế</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-orange-50">Sinh viên hài lòng</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
