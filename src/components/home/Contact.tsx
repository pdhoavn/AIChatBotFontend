import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const locations = [
  {
    city: 'Hà Nội',
    address: 'Khu Giáo dục và Đào tạo, Khu Công nghệ cao Hòa Lạc, Km29 Đại lộ Thăng Long, Hà Nội',
    phone: '024 7300 5588',
    email: 'tuyensinh.hn@fpt.edu.vn',
  },
  {
    city: 'TP. Hồ Chí Minh',
    address: 'Lô E2a-7, Đường D1, Khu Công nghệ cao, P.Long Thạnh Mỹ, Tp. Thủ Đức, TP. HCM',
    phone: '028 7300 5588',
    email: 'tuyensinh.hcm@fpt.edu.vn',
  },
  {
    city: 'Đà Nẵng',
    address: 'Khu đô thị công nghệ FPT Đà Nẵng, Khu Công nghệ cao, P. Hòa Hải, Q. Ngũ Hành Sơn, TP. Đà Nẵng',
    phone: '0236 7300 999',
    email: 'tuyensinh.dn@fpt.edu.vn',
  },
  {
    city: 'Cần Thơ',
    address: '600 Nguyễn Văn Cừ, P. An Bình, Q. Ninh Kiều, TP. Cần Thơ',
    phone: '0292 7300 800',
    email: 'tuyensinh.ct@fpt.edu.vn',
  },
];

export default function Contact() {
  return (
    <section id="contact" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Liên hệ{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              với chúng tôi
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            FPT University có mặt tại các thành phố lớn trên toàn quốc. Hãy tìm cơ sở gần bạn nhất!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {locations.map((location, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-2xl p-8 border border-orange-100 hover:shadow-xl transition-all duration-300"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {location.city}
              </h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-orange-600 mr-3 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">{location.address}</p>
                </div>

                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-orange-600 mr-3 flex-shrink-0" />
                  <a href={`tel:${location.phone}`} className="text-gray-700 hover:text-orange-600 transition-colors">
                    {location.phone}
                  </a>
                </div>

                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-orange-600 mr-3 flex-shrink-0" />
                  <a href={`mailto:${location.email}`} className="text-gray-700 hover:text-orange-600 transition-colors">
                    {location.email}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Working Hours */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-12 text-white text-center">
          <Clock className="h-16 w-16 mx-auto mb-6" />
          <h3 className="text-3xl font-bold mb-4">Thời gian làm việc</h3>
          <div className="max-w-2xl mx-auto space-y-2 text-lg text-orange-50">
            <p>Thứ 2 - Thứ 6: 8:00 - 17:30</p>
            <p>Thứ 7 - Chủ nhật: 8:00 - 12:00</p>
            <p className="mt-6 text-white font-semibold">
              Hotline tư vấn: <a href="tel:19006612" className="hover:underline">1900 6612</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
