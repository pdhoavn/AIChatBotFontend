import { Calendar, FileText, CheckCircle, Award, User, Mail, Phone, GraduationCap, Lock } from 'lucide-react';
import { useState } from 'react';
  import { authAPI } from "@/services/fastapi"; 
  import { useNavigate } from 'react-router';
const steps = [
  {
    icon: FileText,
    title: 'Nộp hồ sơ online',
    description: 'Điền thông tin và nộp hồ sơ trực tuyến dễ dàng',
  },
  {
    icon: Calendar,
    title: 'Tham gia tư vấn',
    description: 'Gặp gỡ chuyên gia tư vấn để hiểu rõ về trường',
  },
  {
    icon: Award,
    title: 'Xét tuyển',
    description: 'Kết quả xét tuyển được thông báo trong 3-5 ngày',
  },
  {
    icon: CheckCircle,
    title: 'Xác nhận nhập học',
    description: 'Hoàn tất thủ tục và chào đón tân sinh viên',
  },
];

export default function Admissions() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    program: '',
    person: '',
  });

    const navigate = useNavigate(); 

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      alert('Vui lòng điền đầy đủ Họ tên, Email, Password');
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Số điện thoại phải bắt đầu bằng 0 và gồm 10 chữ số");
      return;
    }


    // Map sang payload mà BE cần
    const payload = {
      username: formData.email.split('@')[0],
       full_name: formData.name,
      email: formData.email,
      password: formData.password,
      phone_number: formData.phone,    
      role_id: null,                     
      permissions: [],                 
      interest_desired_major: formData.program || null,
      interest_region: formData.person || null,
    };

    // Gọi API FastAPI
    await authAPI.register(payload);

    alert('Bạn đã đăng ký tài khoản thành công! Hãy đăng nhập để tiếp tục.');
navigate('/loginprivate');

    // Reset form
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      program: "",
      person: "",
    });

  } catch (err: any) {
    alert(err?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
  }
};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="admissions" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Quy trình{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Tuyển sinh
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Chỉ 4 bước đơn giản để trở thành sinh viên FPT University
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-orange-300 to-transparent -z-10"></div>
              )}
              <div className="text-center group">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg">
                  <step.icon className="h-12 w-12 text-white" />
                </div>
                <div className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-sm">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Registration Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <GraduationCap className="h-16 w-16 mb-6" />
                <h3 className="text-3xl font-bold mb-4">
                  Đăng ký tuyển sinh ngay hôm nay!
                </h3>
                {/* <p className="text-orange-50 mb-6 leading-relaxed text-lg">
                  Tuyển sinh đợt 1: <span className="font-semibold">Tháng 3 - Tháng 8, 2025</span>
                </p> */}
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Học phí ưu đãi lên đến 50% cho đợt đăng ký sớm</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Nhiều hình thức xét tuyển linh hoạt: Học bạ, THPT, Thi riêng</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Tặng laptop cho tân sinh viên xuất sắc</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" />
                    <span>Hỗ trợ học bổng toàn phần cho học sinh có hoàn cảnh khó khăn</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Đăng ký nhận tư vấn
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="nguyenvana@email.com"
                  />
                </div>
              </div>

               <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>
          
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="0912345678"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="program" className="block text-sm font-semibold text-gray-700 mb-2">
                  Ngành học quan tâm <span className="text-red-500">*</span>
                </label>
                <select
                  id="program"
                  name="program"
                  value={formData.program}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="">Chọn ngành học</option>
                  <option value="software">Kỹ thuật phần mềm</option>
                  <option value="design">Thiết kế đồ họa</option>
                  <option value="ai">Trí tuệ nhân tạo</option>
                  <option value="security">An ninh mạng</option>
                  <option value="business">Kinh doanh số</option>
                  <option value="game">Thiết kế trò chơi</option>
                </select>
              </div>

              {/* <div>
                 <label htmlFor="person" className="block text-sm font-semibold text-gray-700 mb-2">
                  Bạn là? <span className="text-red-500">*</span>
                </label>
                <select
                  id="person"
                  name="person"
                  value={formData.person}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all appearance-none bg-white"
                >
                  <option value="parent">Phụ huynh</option>
                  <option value="student">Học sinh</option>
                </select>
              </div> */}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Đăng ký ngay
              </button>

              <p className="text-xs text-gray-500 text-center">
                Bằng việc đăng ký, bạn đồng ý với các điều khoản và chính sách của chúng tôi
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
