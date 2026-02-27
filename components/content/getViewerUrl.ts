/**
 * Hàm tạo viewer URL dựa trên loại file
 * @param url - URL của file gốc
 * @returns URL của viewer tương ứng
 */
export const getViewerUrl = (url: string): string => {
  const lowerUrl = url.toLowerCase();
  
  // Nếu là PDF thì dùng Google Docs viewer
  if (lowerUrl.endsWith(".pdf")) {
    return `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}`;
  }
  
  // Còn lại dùng Microsoft Office viewer
  return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
};
