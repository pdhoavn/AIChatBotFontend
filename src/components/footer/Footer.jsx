import { GraduationCap, Facebook, Instagram, Youtube, Linkedin } from 'lucide-react';

export default function Footer() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-slate-950 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">FPT University</h3>
                <p className="text-sm text-gray-400">Đại học FPT</p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6">
              Đại học công nghệ hàng đầu Việt Nam, đào tạo nguồn nhân lực chất lượng cao cho kỷ nguyên số.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-white/10 hover:bg-orange-600 p-2.5 rounded-lg transition-all duration-300">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-orange-600 p-2.5 rounded-lg transition-all duration-300">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-orange-600 p-2.5 rounded-lg transition-all duration-300">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="bg-white/10 hover:bg-orange-600 p-2.5 rounded-lg transition-all duration-300">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Liên kết nhanh</h4>
            <ul className="space-y-3">
              <li>
                <button onClick={() => scrollToSection('home')} className="text-gray-400 hover:text-orange-400 transition-colors">
                  Trang chủ
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="text-gray-400 hover:text-orange-400 transition-colors">
                  Giới thiệu
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('programs')} className="text-gray-400 hover:text-orange-400 transition-colors">
                  Ngành học
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('admissions')} className="text-gray-400 hover:text-orange-400 transition-colors">
                  Tuyển sinh
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="text-gray-400 hover:text-orange-400 transition-colors">
                  Liên hệ
                </button>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="text-lg font-bold mb-6">Ngành học</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                  Kỹ thuật phần mềm
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                  Thiết kế đồ họa
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                  Trí tuệ nhân tạo
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                  An ninh mạng
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                  Kinh doanh số
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-bold mb-6">Liên hệ</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <span className="font-semibold text-white">Hotline:</span><br />
                <a href="tel:19006612" className="hover:text-orange-400 transition-colors">
                  1900 6612
                </a>
              </li>
              <li>
                <span className="font-semibold text-white">Email:</span><br />
                <a href="mailto:tuyensinh@fpt.edu.vn" className="hover:text-orange-400 transition-colors">
                  tuyensinh@fpt.edu.vn
                </a>
              </li>
              <li>
                <span className="font-semibold text-white">Giờ làm việc:</span><br />
                T2 - T6: 8:00 - 17:30<br />
                T7 - CN: 8:00 - 12:00
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © 2025 FPT University. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                Điều khoản sử dụng
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
