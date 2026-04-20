#!/usr/bin/env node
/**
 * Translation Helper Script
 * Scans staff component files and lists all English text that needs translation
 * Run: node translate-helper.js
 */

const fs = require('fs');
const path = require('path');

// Translation mapping from Vietnamese_Translate.md
const translations = {
  // Common Actions
  "Create": "Tạo Mới",
  "Edit": "Chỉnh Sửa",
  "Delete": "Xóa",
  "Save": "Lưu",
  "Cancel": "Hủy",
  "Confirm": "Xác Nhận",
  "Submit": "Gửi",
  "Add": "Thêm",
  "Remove": "Gỡ Bỏ",
  "Search": "Tìm Kiếm",
  "Filter": "Lọc",
  "Logout": "Đăng Xuất",
  "Login": "Đăng Nhập",
  
  // Dashboard
  "Dashboard": "Bảng Điều Khiển",
  "Overview": "Tổng Quan",
  "Statistics": "Thống Kê",
  "Analytics": "Phân Tích",
  
  // Status
  "Active": "Đang Hoạt Động",
  "Inactive": "Không Hoạt Động",
  "Pending": "Đang Chờ",
  "Completed": "Hoàn Thành",
  "Published": "Đã Xuất Bản",
  "Drafted": "Bản Nháp",
  "Rejected": "Bị Từ Chối",
  
  // Messages
  "Loading...": "Đang tải...",
  "Loading data...": "Đang tải dữ liệu...",
  "No results found": "Không tìm thấy kết quả",
  "Try adjusting your search or filters": "Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn",
  "Failed to load": "Không thể tải",
  "Successfully saved": "Lưu thành công",
  "Successfully deleted": "Xóa thành công",
  
  // Specific pages
  "Request Queue": "Hàng Đợi Yêu Cầu",
  "Live Consultation": "Tư Vấn Trực Tiếp",
  "Knowledge Base": "Cơ Sở Tri Thức",
  "Student List": "Danh Sách Học Sinh",
  "Training Questions": "Câu Hỏi Huấn Luyện",
  "Content Optimization": "Tối Ưu Hóa Nội Dung",
  "User Management": "Quản Lý Người Dùng",
  "Q&A Templates": "Mẫu Q&A",
  
  // Add more translations from Vietnamese_Translate.md as needed
};

function findEnglishText(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const englishPatterns = [
    // Match JSX text content: >text<
    />\s*([A-Z][a-zA-Z\s]+)\s*</g,
    // Match string literals: "text" or 'text'
    /["']([A-Z][a-zA-Z\s,.!?]+)["']/g,
    // Match placeholder text
    /placeholder=["']([A-Za-z\s,.!?]+)["']/g,
  ];
  
  const found = new Set();
  
  englishPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const text = match[1].trim();
      // Filter out code-like strings
      if (text.length > 2 && !text.includes('_') && !text.includes('/')) {
        found.add(text);
      }
    }
  });
  
  return Array.from(found);
}

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      scanDirectory(filePath, results);
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
      const englishTexts = findEnglishText(filePath);
      if (englishTexts.length > 0) {
        results.push({ file: filePath, texts: englishTexts });
      }
    }
  });
  
  return results;
}

// Main execution
const staffPaths = [
  './src/components/admin',
  './src/components/consultant',
  './src/components/admission',
  './src/components/content',
];

console.log('🔍 Scanning for English text in staff pages...\n');

staffPaths.forEach(dirPath => {
  if (fs.existsSync(dirPath)) {
    console.log(`📁 Scanning: ${dirPath}`);
    const results = scanDirectory(dirPath);
    
    results.forEach(({ file, texts }) => {
      console.log(`\n📄 ${file}`);
      texts.forEach(text => {
        const translated = translations[text];
        if (translated) {
          console.log(`  ✅ "${text}" → "${translated}"`);
        } else {
          console.log(`  ❌ "${text}" → [NEEDS TRANSLATION]`);
        }
      });
    });
  }
});

console.log('\n✨ Scan complete!');
console.log('Add missing translations to Vietnamese_Translate.md');
