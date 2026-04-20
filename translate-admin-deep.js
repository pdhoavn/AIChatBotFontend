#!/usr/bin/env node
/**
 * Deep Translation Tool for Admin Components
 * Comprehensive translation including buttons, statistics, validations, toast messages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// COMPREHENSIVE Translation Dictionary for Admin Components
const TRANSLATIONS = {
  // ===== SYSTEM & DASHBOARD =====
  "System Dashboard": "Bảng Điều Khiển Hệ Thống",
  "Real-time admission chatbot analytics and monitoring": "Phân tích và giám sát chatbot tuyển sinh theo thời gian thực",
  "System Statistics": "Thống Kê Hệ Thống",
  "Knowledge base and content metrics": "Số liệu cơ sở tri thức và nội dung",
  "System Admins": "Quản Trị Viên Hệ Thống",
  "Content Managers": "Quản Lý Nội Dung",
  "Admission Officers": "Cán Bộ Tuyển Sinh",
  "Consultants": "Tư Vấn Viên",
  "active users": "người dùng đang hoạt động",
  
  // ===== METRICS & STATISTICS =====
  "Active Chatbot Sessions": "Phiên Chatbot Đang Hoạt Động",
  "AI-powered conversations": "Cuộc trò chuyện được hỗ trợ bởi AI",
  "Total Customers": "Tổng Số Khách Hàng",
  "Unique students & parents": "Học sinh và phụ huynh duy nhất",
  "Active Live Sessions": "Phiên Trực Tiếp Đang Hoạt Động",
  "Human agent chats": "Trò chuyện với nhân viên",
  "Chatbot Requests (Last 30 Days)": "Yêu Cầu Chatbot (30 Ngày Qua)",
  "Customer messages vs chatbot responses": "Tin nhắn khách hàng so với phản hồi chatbot",
  "Customer Messages": "Tin Nhắn Khách Hàng",
  "Chatbot Responses": "Phản Hồi Chatbot",
  "KB Documents": "Tài Liệu Cơ Sở Tri Thức",
  "Training Q&A Pairs": "Cặp Câu Hỏi & Trả Lời Huấn Luyện",
  "Total Users": "Tổng Số Người Dùng",
  "Loading dashboard...": "Đang tải bảng điều khiển...",
  
  // ===== USER MANAGEMENT =====
  "User Management": "Quản Lý Người Dùng",
  "Add User": "Thêm Người Dùng",
  "Add New User": "Thêm Người Dùng Mới",
  "Edit User": "Chỉnh Sửa Người Dùng",
  "Delete User": "Xóa Người Dùng",
  "User Details": "Chi Tiết Người Dùng",
  "Grant Permission": "Cấp Quyền",
  "Revoke Permission": "Thu Hồi Quyền",
  "Change Role": "Thay Đổi Vai Trò",
  "Ban User": "Cấm Người Dùng",
  "Unban User": "Bỏ Cấm Người Dùng",
  "Reset Password": "Đặt Lại Mật Khẩu",
  
  // ===== Q&A TEMPLATE MANAGER =====
  "Q&A Template Manager": "Quản Lý Mẫu Q&A",
  "Create Template": "Tạo Mẫu",
  "Edit Template": "Chỉnh Sửa Mẫu",
  "Delete Template": "Xóa Mẫu",
  "Template Name": "Tên Mẫu",
  "Template Fields": "Trường Mẫu",
  "Field Name": "Tên Trường",
  "Field Type": "Loại Trường",
  "Field Order": "Thứ Tự Trường",
  "Add Field": "Thêm Trường",
  "Remove Field": "Xóa Trường",
  "Text Input": "Nhập Văn Bản",
  "Text Area": "Vùng Văn Bản",
  "Number": "Số",
  "Date": "Ngày",
  "Email": "Email",
  "File Upload": "Tải Lên Tệp",
  "Dropdown": "Danh Sách Thả Xuống",
  "Checkbox": "Hộp Kiểm",
  "Radio Button": "Nút Radio",
  "field(s)": "trường",
  
  // ===== FORM LABELS & FIELDS =====
  "Full Name": "Họ và Tên",
  "Name": "Tên",
  "Email": "Email",
  "Phone": "Số Điện Thoại",
  "Phone Number": "Số Điện Thoại",
  "Password": "Mật Khẩu",
  "Confirm Password": "Xác Nhận Mật Khẩu",
  "Role": "Vai Trò",
  "Permissions": "Quyền Hạn",
  "Status": "Trạng Thái",
  "Date of Birth": "Ngày Sinh",
  "Address": "Địa Chỉ",
  "Category": "Danh Mục",
  "Categories": "Danh Mục",
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
  "Last Active": "Hoạt Động Lần Cuối",
  "Actions": "Thao Tác",
  "Select Role": "Chọn Vai Trò",
  "Select Permissions": "Chọn Quyền Hạn",
  "Select All": "Chọn Tất Cả",
  "Deselect All": "Bỏ Chọn Tất Cả",
  
  // ===== SEARCH & FILTER =====
  "Search...": "Tìm kiếm...",
  "Search": "Tìm Kiếm",
  "Search by name, email, or ID": "Tìm kiếm theo tên, email, hoặc mã số",
  "Search users...": "Tìm kiếm người dùng...",
  "Search templates...": "Tìm kiếm mẫu...",
  "Filter by": "Lọc theo",
  "Filter": "Lọc",
  "Filter by role": "Lọc theo vai trò",
  "Filter by status": "Lọc theo trạng thái",
  "Sort by": "Sắp xếp theo",
  "All Roles": "Tất Cả Vai Trò",
  "All Status": "Tất Cả Trạng Thái",
  
  // ===== STATUS VALUES =====
  "Active": "Đang Hoạt Động",
  "Inactive": "Không Hoạt Động",
  "Pending": "Đang Chờ",
  "Completed": "Hoàn Thành",
  "In Progress": "Đang Thực Hiện",
  "Published": "Đã Xuất Bản",
  "Draft": "Bản Nháp",
  "Rejected": "Bị Từ Chối",
  "Approved": "Đã Phê Duyệt",
  "Suspended": "Bị Đình Chỉ",
  "Banned": "Bị Cấm",
  "Verified": "Đã Xác Minh",
  "Unverified": "Chưa Xác Minh",
  
  // ===== TOAST MESSAGES - SUCCESS =====
  "Successfully created": "Tạo thành công",
  "Successfully updated": "Cập nhật thành công",
  "Successfully deleted": "Xóa thành công",
  "Successfully saved": "Lưu thành công",
  "User created successfully": "Tạo người dùng thành công",
  "User updated successfully": "Cập nhật người dùng thành công",
  "User deleted successfully": "Xóa người dùng thành công",
  "User banned successfully": "Cấm người dùng thành công",
  "User unbanned successfully": "Bỏ cấm người dùng thành công",
  "Template created successfully": "Tạo mẫu thành công",
  "Template updated successfully": "Cập nhật mẫu thành công",
  "Template deleted successfully": "Xóa mẫu thành công",
  "Changes saved successfully": "Lưu thay đổi thành công",
  "Password reset successfully": "Đặt lại mật khẩu thành công",
  "Permission granted successfully": "Cấp quyền thành công",
  "Permission revoked successfully": "Thu hồi quyền thành công",
  
  // ===== TOAST MESSAGES - ERROR =====
  "Failed to load": "Không thể tải",
  "Failed to save": "Không thể lưu",
  "Failed to delete": "Không thể xóa",
  "Failed to create": "Không thể tạo",
  "Failed to update": "Không thể cập nhật",
  "Failed to load dashboard data": "Không thể tải dữ liệu bảng điều khiển",
  "Failed to load users": "Không thể tải người dùng",
  "Failed to load templates": "Không thể tải mẫu",
  "Failed to save template": "Không thể lưu mẫu",
  "Failed to delete template": "Không thể xóa mẫu",
  "Failed to load permissions data": "Không thể tải dữ liệu quyền hạn",
  "Failed to load roles data": "Không thể tải dữ liệu vai trò",
  "Failed to ban user": "Không thể cấm người dùng",
  "Failed to unban user": "Không thể bỏ cấm người dùng",
  "Invalid input": "Đầu vào không hợp lệ",
  "Permission denied": "Không có quyền truy cập",
  "Not found": "Không tìm thấy",
  "Error": "Lỗi",
  "An error occurred": "Đã xảy ra lỗi",
  "Something went wrong": "Đã có lỗi xảy ra",
  
  // ===== VALIDATION MESSAGES =====
  "Please enter a template name": "Vui lòng nhập tên mẫu",
  "Please enter a valid email": "Vui lòng nhập email hợp lệ",
  "Please enter a password": "Vui lòng nhập mật khẩu",
  "Passwords do not match": "Mật khẩu không khớp",
  "Please select a role": "Vui lòng chọn vai trò",
  "Please fill in all required fields": "Vui lòng điền tất cả các trường bắt buộc",
  "Template must have at least one field": "Mẫu phải có ít nhất một trường",
  "Field name is required": "Tên trường là bắt buộc",
  "Email already exists": "Email đã tồn tại",
  "Username already exists": "Tên người dùng đã tồn tại",
  "Password must be at least 8 characters": "Mật khẩu phải có ít nhất 8 ký tự",
  "No authentication token found. Please login again.": "Không tìm thấy token xác thực. Vui lòng đăng nhập lại.",
  "Authentication token expired. Please login again.": "Token xác thực đã hết hạn. Vui lòng đăng nhập lại.",
  "Invalid authentication token. Please login again.": "Token xác thực không hợp lệ. Vui lòng đăng nhập lại.",
  
  // ===== LOADING STATES =====
  "Loading...": "Đang tải...",
  "Loading data...": "Đang tải dữ liệu...",
  "Loading users...": "Đang tải người dùng...",
  "Loading templates...": "Đang tải mẫu...",
  "Loading dashboard...": "Đang tải bảng điều khiển...",
  "Processing...": "Đang xử lý...",
  "Please wait...": "Vui lòng đợi...",
  "Saving...": "Đang lưu...",
  "Deleting...": "Đang xóa...",
  "Creating...": "Đang tạo...",
  "Updating...": "Đang cập nhật...",
  
  // ===== EMPTY STATES =====
  "No results found": "Không tìm thấy kết quả",
  "No data available": "Không có dữ liệu",
  "No templates found": "Không tìm thấy mẫu",
  "No users found": "Không tìm thấy người dùng",
  "No permissions found": "Không tìm thấy quyền hạn",
  "Try adjusting your search or filters": "Thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn",
  
  // ===== CONFIRMATION MESSAGES =====
  "Are you sure?": "Bạn có chắc không?",
  "Are you sure you want to delete this template?": "Bạn có chắc muốn xóa mẫu này không?",
  "Are you sure you want to delete this user?": "Bạn có chắc muốn xóa người dùng này không?",
  "Are you sure you want to ban this user?": "Bạn có chắc muốn cấm người dùng này không?",
  "Are you sure you want to logout?": "Bạn có chắc muốn đăng xuất?",
  "Unsaved changes will be lost": "Các thay đổi chưa lưu sẽ bị mất",
  "Confirm Deletion": "Xác Nhận Xóa",
  "Confirm Action": "Xác Nhận Hành Động",
  "This action cannot be undone": "Hành động này không thể hoàn tác",
  
  // ===== BUTTONS & ACTIONS =====
  "Create": "Tạo Mới",
  "Create New": "Tạo Mới",
  "Edit": "Chỉnh Sửa",
  "Delete": "Xóa",
  "Save": "Lưu",
  "Save Changes": "Lưu Thay Đổi",
  "Cancel": "Hủy",
  "Confirm": "Xác Nhận",
  "Submit": "Gửi",
  "Add": "Thêm",
  "Remove": "Gỡ Bỏ",
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
  "Apply": "Áp Dụng",
  "Reset": "Đặt Lại",
  "Clear": "Xóa",
  "Show": "Hiển Thị",
  "Hide": "Ẩn",
  "Expand": "Mở Rộng",
  "Collapse": "Thu Gọn",
  "More": "Thêm",
  "Less": "Ít Hơn",
  
  // ===== TABLE HEADERS =====
  "ID": "Mã",
  "Username": "Tên Người Dùng",
  "User ID": "Mã Người Dùng",
  "Template ID": "Mã Mẫu",
  "Last Login": "Đăng Nhập Lần Cuối",
  "Registered": "Đã Đăng Ký",
  "Modified": "Đã Chỉnh Sửa",
  
  // ===== MISC =====
  "Settings": "Cài Đặt",
  "Profile": "Hồ Sơ",
  "Help": "Trợ Giúp",
  "Documentation": "Tài Liệu",
  "Support": "Hỗ Trợ",
  "Yes": "Có",
  "No": "Không",
  "OK": "Đồng Ý",
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
  "Required": "Bắt buộc",
  "Optional": "Tùy chọn",
  "All": "Tất Cả",
};

// Configuration
const CONFIG = {
  dryRun: false,
  createBackup: false,
  verbose: false,
  targetDir: './src/components/admin',
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
 * Escape special regex characters
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    const jsxMatches = newContent.match(jsxPattern);
    if (jsxMatches) {
      newContent = newContent.replace(jsxPattern, `>${vietnamese}<`);
      translationCount += jsxMatches.length;
      modified = true;
    }
    
    // Pattern 2: String literals in JSX props: "English text" or 'English text'
    const stringPattern = new RegExp(`(["'])${escapeRegex(english)}\\1`, 'g');
    const stringMatches = newContent.match(stringPattern);
    if (stringMatches) {
      newContent = newContent.replace(stringPattern, `$1${vietnamese}$1`);
      translationCount += stringMatches.length;
      modified = true;
    }
    
    // Pattern 3: Template literals: `English text`
    const templatePattern = new RegExp('`' + escapeRegex(english) + '`', 'g');
    const templateMatches = newContent.match(templatePattern);
    if (templateMatches) {
      newContent = newContent.replace(templatePattern, `\`${vietnamese}\``);
      translationCount += templateMatches.length;
      modified = true;
    }
  });
  
  if (CONFIG.verbose && translationCount > 0) {
    console.log(`  📝 ${translationCount} translations found in ${path.basename(filePath)}`);
  }
  
  return { newContent, modified, translationCount };
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
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.ts')) {
      // Skip backup files
      if (file.endsWith('.backup')) return;
      processFile(filePath);
    }
  });
}

/**
 * Main execution
 */
function main() {
  console.log('🌐 Deep Translation Tool for Admin Components');
  console.log('==============================================\n');
  
  if (CONFIG.dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  if (CONFIG.createBackup && !CONFIG.dryRun) {
    console.log('📦 Backup mode enabled - Creating backups before translation\n');
  }
  
  console.log(`📚 Translation dictionary: ${Object.keys(TRANSLATIONS).length} entries\n`);
  
  console.log(`📁 Processing: ${CONFIG.targetDir}`);
  processDirectory(CONFIG.targetDir);
  
  // Print summary
  console.log('\n==============================================');
  console.log('📊 Translation Summary');
  console.log('==============================================');
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
