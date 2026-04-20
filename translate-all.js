#!/usr/bin/env node
/**
 * Automatic Translation Tool for Staff Pages
 * 
 * This tool automatically translates English text to Vietnamese across all staff components
 * based on the translation dictionary from Vietnamese_Translate.md
 * 
 * Usage:
 *   node translate-all.js --dry-run    # Preview changes without modifying files
 *   node translate-all.js --apply      # Apply translations to files
 *   node translate-all.js --backup     # Create backups before translating
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive translation dictionary from Vietnamese_Translate.md
const TRANSLATIONS = {
  // ==== COMMON ACTIONS & BUTTONS ====
  "Create": "Tạo Mới",
  "Create New": "Tạo Mới",
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
  "Refresh": "Làm Mới",
  "Refresh Data": "Làm Mới Dữ Liệu",
  "Export": "Xuất",
  "Import": "Nhập",
  "Download": "Tải Xuống",
  "Upload": "Tải Lên",
  "View": "Xem",
  "View Details": "Xem Chi Tiết",
  "Close": "Đóng",
  "Back": "Quay Lại",
  "Next": "Tiếp Theo",
  "Previous": "Trước",
  "Continue": "Tiếp Tục",
  
  // ==== USER MANAGEMENT ====
  "Add User": "Thêm Người Dùng",
  "Add New User": "Thêm Người Dùng Mới",
  "Edit User": "Chỉnh Sửa Người Dùng",
  "Delete User": "Xóa Người Dùng",
  "User Details": "Chi Tiết Người Dùng",
  "User Management": "Quản Lý Người Dùng",
  "Grant Permission": "Cấp Quyền",
  "Revoke Permission": "Thu Hồi Quyền",
  "Change Role": "Thay Đổi Vai Trò",
  
  // ==== CONTENT MANAGEMENT ====
  "New Article": "Bài Viết Mới",
  "All Articles": "Tất Cả Bài Viết",
  "Publish": "Xuất Bản",
  "Draft": "Lưu Nháp",
  "Review": "Duyệt Bài",
  "Review Queue": "Hàng Đợi Duyệt Bài",
  "Approve": "Phê Duyệt",
  "Reject": "Từ Chối",
  "Content Dashboard": "Tổng Quan Nội Dung",
  "Article Editor": "Trình Soạn Thảo Bài Viết",
  "Content Optimization": "Tối Ưu Hóa Nội Dung",
  "Content Optimization Suggestions": "Đề Xuất Tối Ưu Hóa Nội Dung",
  
  // ==== DASHBOARD & ANALYTICS ====
  "Dashboard": "Bảng Điều Khiển",
  "Dashboard Home": "Trang Chủ Dashboard",
  "Overview": "Tổng Quan",
  "Statistics": "Thống Kê",
  "Analytics": "Phân Tích",
  "Analytics & Statistics": "Phân Tích & Thống Kê",
  "Performance": "Hiệu Suất",
  "Metrics": "Số Liệu",
  "Reports": "Báo Cáo",
  "Insights": "Thông Tin Chi Tiết",
  
  // ==== ADMISSION OFFICER ====
  "Request Queue": "Hàng Đợi Yêu Cầu",
  "Live Consultation": "Tư Vấn Trực Tiếp",
  "Knowledge Base": "Cơ Sở Tri Thức",
  "Student List": "Danh Sách Học Sinh",
  "Admission Dashboard": "Tổng Quan Tuyển Sinh",
  "Today's Overview": "Tổng Quan Hôm Nay",
  "Chatbot Interaction": "Tương Tác Chatbot",
  "Published Articles": "Bài Viết Đã Xuất Bản",
  "Consultation Queue": "Hàng Đợi Tư Vấn",
  "New Content": "Nội Dung Mới",
  "Go to Queue": "Đến Hàng Đợi",
  "Go to Request Queue": "Đến Hàng Đợi Yêu Cầu",
  "Accept Request": "Chấp Nhận Yêu Cầu",
  "Reject Request": "Từ Chối Yêu Cầu",
  
  // ==== CONSULTANT ====
  "Training Questions": "Câu Hỏi Huấn Luyện",
  "Leader Review": "Đánh Giá Giám Sát",
  "Consultant Dashboard": "Bảng Điều Khiển Tư Vấn",
  "Document Management": "Quản Lý Tài Liệu",
  "Q&A Templates": "Mẫu Q&A",
  "Q&A Template Management": "Quản Lý Mẫu Q&A",
  "Add Template": "Thêm Mẫu",
  "Edit Template": "Chỉnh Sửa Mẫu",
  "Delete Template": "Xóa Mẫu",
  
  // ==== STATUS VALUES ====
  "Active": "Đang Hoạt Động",
  "Inactive": "Không Hoạt Động",
  "Pending": "Đang Chờ",
  "Completed": "Hoàn Thành",
  "In Progress": "Đang Thực Hiện",
  "Published": "Đã Xuất Bản",
  "Drafted": "Bản Nháp",
  "Rejected": "Bị Từ Chối",
  "Approved": "Đã Phê Duyệt",
  "Suspended": "Bị Đình Chỉ",
  "All Status": "Tất Cả Trạng Thái",
  "Answered": "Đã Trả Lời",
  "Unanswered": "Chưa Trả Lời",
  
  // ==== FORM LABELS ====
  "Full Name": "Họ và Tên",
  "Name": "Tên",
  "Email": "Email",
  "Phone": "Số Điện Thoại",
  "Password": "Mật Khẩu",
  "Confirm Password": "Xác Nhận Mật Khẩu",
  "Role": "Vai Trò",
  "Permissions": "Quyền Hạn",
  "Status": "Trạng Thái",
  "Date of Birth": "Ngày Sinh",
  "Address": "Địa Chỉ",
  "Category": "Danh Mục",
  "Categories": "Danh Mục",
  "All Categories": "Tất Cả Danh Mục",
  "Tags": "Thẻ",
  "Title": "Tiêu Đề",
  "Description": "Mô Tả",
  "Content": "Nội Dung",
  "Question": "Câu Hỏi",
  "Answer": "Câu Trả Lời",
  "Intent": "Danh Mục",
  "Priority": "Ưu Tiên",
  "Type": "Loại",
  "Created Date": "Ngày Tạo",
  "Modified Date": "Ngày Chỉnh Sửa",
  "Created At": "Được Tạo Lúc",
  "Updated At": "Cập Nhật Lúc",
  "Actions": "Thao Tác",
  
  // ==== SEARCH & FILTER ====
  "Search...": "Tìm kiếm...",
  "Search": "Tìm Kiếm",
  "Search by name, email, or ID": "Tìm kiếm theo tên, email, hoặc mã số",
  "Search by keyword, category or tag": "Tìm kiếm theo từ khóa, danh mục hoặc thẻ",
  "Search articles, reports, students": "Tìm kiếm bài viết, báo cáo, sinh viên",
  "Search templates...": "Tìm kiếm mẫu...",
  "Search users...": "Tìm kiếm người dùng...",
  "Search documents...": "Tìm kiếm tài liệu...",
  "Filter by": "Lọc theo",
  "Filter": "Lọc",
  "Sort by": "Sắp xếp theo",
  
  // ==== MESSAGES - SUCCESS ====
  "Successfully created": "Tạo thành công",
  "Successfully updated": "Cập nhật thành công",
  "Successfully deleted": "Xóa thành công",
  "Successfully saved": "Lưu thành công",
  "Successfully published": "Xuất bản thành công",
  "Document downloaded successfully": "Tải tài liệu thành công",
  "Document downloaded successfully!": "Tải tài liệu thành công!",
  "Changes saved successfully": "Lưu thay đổi thành công",
  
  // ==== MESSAGES - ERROR ====
  "Failed to load": "Không thể tải",
  "Failed to save": "Không thể lưu",
  "Failed to delete": "Không thể xóa",
  "Failed to download": "Không thể tải xuống",
  "Failed to download document": "Không thể tải tài liệu",
  "Failed to load templates": "Không thể tải mẫu",
  "Failed to load users": "Không thể tải người dùng",
  "Failed to load data": "Không thể tải dữ liệu",
  "Invalid input": "Đầu vào không hợp lệ",
  "Permission denied": "Không có quyền truy cập",
  "Not found": "Không tìm thấy",
  "Error": "Lỗi",
  "An error occurred": "Đã xảy ra lỗi",
  
  // ==== MESSAGES - INFO/LOADING ====
  "Loading...": "Đang tải...",
  "Loading data...": "Đang tải dữ liệu...",
  "Loading templates...": "Đang tải mẫu...",
  "Loading users...": "Đang tải người dùng...",
  "Loading dashboard data...": "Đang tải dữ liệu dashboard...",
  "Loading analytics data...": "Đang tải dữ liệu phân tích...",
  "Processing...": "Đang xử lý...",
  "Please wait...": "Vui lòng đợi...",
  
  // ==== MESSAGES - EMPTY STATES ====
  "No results found": "Không tìm thấy kết quả",
  "No data available": "Không có dữ liệu",
  "No templates found": "Không tìm thấy mẫu",
  "No users found": "Không tìm thấy người dùng",
  "No articles found": "Không tìm thấy bài viết",
  "No students found": "Không tìm thấy học sinh",
  "No documents found": "Không tìm thấy tài liệu",
  "No questions found": "Không tìm thấy câu hỏi",
  "No requests in queue": "Không có yêu cầu trong hàng đợi",
  "No active sessions": "Không có phiên hoạt động",
  "Try adjusting your search or filters": "Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn",
  "No article data this week": "Chưa có dữ liệu bài viết trong tuần này",
  "No Intent data in system": "Chưa có dữ liệu Danh mục trong hệ thống",
  
  // ==== CONFIRMATION MESSAGES ====
  "Are you sure?": "Bạn có chắc không?",
  "Are you sure you want to logout?": "Bạn có chắc muốn đăng xuất?",
  "Are you sure you want to delete?": "Bạn có chắc muốn xóa?",
  "Are you sure you want to publish?": "Bạn có chắc muốn xuất bản?",
  "Unsaved changes will be lost": "Các thay đổi chưa lưu sẽ bị mất",
  "Confirm Deletion": "Xác Nhận Xóa",
  "This action cannot be undone": "Hành động này không thể hoàn tác",
  
  // ==== TIME & DATE ====
  "Today": "Hôm Nay",
  "Yesterday": "Hôm Qua",
  "Last 7 days": "7 Ngày Qua",
  "Last 30 days": "30 Ngày Qua",
  "Last 90 days": "90 Ngày Qua",
  "This week": "Tuần Này",
  "This month": "Tháng Này",
  "Sessions ended in 30 days": "Phiên kết thúc trong 30 ngày",
  
  // ==== TABLE HEADERS ====
  "ID": "Mã",
  "Name": "Tên",
  "Email": "Email",
  "Role": "Vai Trò",
  "Status": "Trạng Thái",
  "Created Date": "Ngày Tạo",
  "Modified Date": "Ngày Chỉnh Sửa",
  "Actions": "Thao Tác",
  "Permissions": "Quyền Hạn",
  
  // ==== CHARTS & STATISTICS ====
  "Weekly Article Statistics": "Thống Kê Bài Viết Trong Tuần",
  "Knowledge Base Trends": "Xu Hướng Cơ Sở Tri Thức",
  "Category Interest": "Danh Mục Quan Tâm",
  "Questions Detail": "Chi Tiết Câu Hỏi",
  "Trending Topics": "Chủ Đề Thịnh Hành",
  "Knowledge Gaps": "Khoảng Trống Tri Thức",
  "Low Satisfaction Answers": "Câu Trả Lời Đánh Giá Thấp",
  "Recent Questions": "Câu Hỏi Gần Đây",
  "Articles published in last 7 days": "Số lượng bài viết được xuất bản trong 7 ngày qua",
  "Intent distribution from training questions": "Phân bổ Danh mục từ câu hỏi huấn luyện",
  "Total public articles": "Tổng số bài viết công khai",
  "Your pending requests": "Yêu cầu đang chờ của bạn",
  "Drafts pending publish": "Bản nháp chờ xuất bản",
  "Monitor performance and student interaction": "Theo dõi hiệu suất và tương tác của sinh viên",
  
  // ==== MISC ====
  "Settings": "Cài Đặt",
  "Profile": "Hồ Sơ",
  "Help": "Trợ Giúp",
  "Documentation": "Tài Liệu",
  "Support": "Hỗ Trợ",
  "Version": "Phiên Bản",
  "About": "Giới Thiệu",
  "Language": "Ngôn Ngữ",
  "Theme": "Giao Diện",
  "Notifications": "Thông Báo",
  "Yes": "Có",
  "No": "Không",
  "OK": "Đồng Ý",
  "Apply": "Áp Dụng",
  "Reset": "Đặt Lại",
  "Clear": "Xóa",
  "Select": "Chọn",
  "Select All": "Chọn Tất Cả",
  "Deselect All": "Bỏ Chọn Tất Cả",
  "Show": "Hiển Thị",
  "Hide": "Ẩn",
  "Expand": "Mở Rộng",
  "Collapse": "Thu Gọn",
  "More": "Thêm",
  "Less": "Ít Hơn",
  "Details": "Chi Tiết",
  "Summary": "Tóm Tắt",
  "Total": "Tổng",
  "Count": "Số Lượng",
  "Items": "Mục",
  "Page": "Trang",
  "of": "của",
  "Showing": "Hiển thị",
  "to": "đến",
  "entries": "mục",
};

// Configuration
const CONFIG = {
  dryRun: false,
  createBackup: false,
  verbose: false,
  targetDirs: [
    './src/components/admin',
    './src/components/consultant',
    './src/components/admission',
    './src/components/content',
  ],
  excludePatterns: [
    /node_modules/,
    /\.git/,
    /\.test\./,
    /\.spec\./,
  ],
};

// Parse command line arguments
process.argv.slice(2).forEach(arg => {
  if (arg === '--dry-run') CONFIG.dryRun = true;
  if (arg === '--apply') CONFIG.dryRun = false;
  if (arg === '--backup') CONFIG.createBackup = true;
  if (arg === '--verbose' || arg === '-v') CONFIG.verbose = true;
});

// Statistics
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  translationsApplied: 0,
  errors: 0,
};

/**
 * Create a backup of a file
 */
function createBackup(filePath) {
  const backupPath = `${filePath}.backup`;
  try {
    fs.copyFileSync(filePath, backupPath);
    if (CONFIG.verbose) console.log(`  📦 Backup created: ${backupPath}`);
  } catch (err) {
    console.error(`  ❌ Failed to create backup for ${filePath}:`, err.message);
    stats.errors++;
  }
}

/**
 * Translate text in file content
 */
function translateContent(content, filePath) {
  let modified = false;
  let translationCount = 0;
  let newContent = content;
  
  // Sort translations by length (longest first) to avoid partial replacements
  const sortedTranslations = Object.entries(TRANSLATIONS).sort((a, b) => b[0].length - a[0].length);
  
  sortedTranslations.forEach(([english, vietnamese]) => {
    // Skip if already translated
    if (newContent.includes(vietnamese)) return;
    
    // Pattern 1: JSX text content: >{English text}<
    const jsxPattern = new RegExp(`>\\s*${escapeRegex(english)}\\s*<`, 'g');
    if (jsxPattern.test(newContent)) {
      newContent = newContent.replace(jsxPattern, `>${vietnamese}<`);
      translationCount++;
      modified = true;
    }
    
    // Pattern 2: String literals in props: "English text" or 'English text'
    const stringPattern = new RegExp(`(["'])${escapeRegex(english)}\\1`, 'g');
    if (stringPattern.test(newContent)) {
      newContent = newContent.replace(stringPattern, `$1${vietnamese}$1`);
      translationCount++;
      modified = true;
    }
    
    // Pattern 3: Template literals: `English text`
    const templatePattern = new RegExp('`' + escapeRegex(english) + '`', 'g');
    if (templatePattern.test(newContent)) {
      newContent = newContent.replace(templatePattern, `\`${vietnamese}\``);
      translationCount++;
      modified = true;
    }
  });
  
  if (CONFIG.verbose && translationCount > 0) {
    console.log(`  📝 ${translationCount} translations found in ${path.basename(filePath)}`);
  }
  
  return { newContent, modified, translationCount };
}

/**
 * Escape special regex characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Process a single file
 */
function processFile(filePath) {
  stats.filesProcessed++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { newContent, modified, translationCount } = translateContent(content, filePath);
    
    if (modified) {
      stats.filesModified++;
      stats.translationsApplied += translationCount;
      
      if (CONFIG.dryRun) {
        console.log(`  🔍 Would translate ${translationCount} strings in: ${filePath}`);
      } else {
        if (CONFIG.createBackup) {
          createBackup(filePath);
        }
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`  ✅ Translated ${translationCount} strings in: ${filePath}`);
      }
    }
  } catch (err) {
    console.error(`  ❌ Error processing ${filePath}:`, err.message);
    stats.errors++;
  }
}

/**
 * Scan and process directory recursively
 */
function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return;
  }
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    // Check exclusion patterns
    if (CONFIG.excludePatterns.some(pattern => pattern.test(filePath))) {
      return;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx')) {
      processFile(filePath);
    }
  });
}

/**
 * Main execution
 */
function main() {
  console.log('🌐 Staff Pages Translation Tool');
  console.log('================================\n');
  
  if (CONFIG.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  if (CONFIG.createBackup && !CONFIG.dryRun) {
    console.log('📦 Backup mode enabled - Creating backups before translation\n');
  }
  
  console.log(`📚 Translation dictionary: ${Object.keys(TRANSLATIONS).length} entries\n`);
  
  CONFIG.targetDirs.forEach(dir => {
    console.log(`📁 Processing: ${dir}`);
    processDirectory(dir);
  });
  
  // Print summary
  console.log('\n================================');
  console.log('📊 Translation Summary');
  console.log('================================');
  console.log(`Files processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`Total translations applied: ${stats.translationsApplied}`);
  console.log(`Errors: ${stats.errors}`);
  
  if (CONFIG.dryRun) {
    console.log('\n💡 Run with --apply to apply these translations');
    console.log('💡 Run with --backup to create backups before applying');
  } else {
    console.log('\n✨ Translation complete!');
  }
}

// Run the tool
main();
