"use client";

import { Tabs } from "antd";

export default function ExamFormatGuide() {
  return (
    <>
      <style jsx global>{`
        .custom-tabs-header .ant-tabs-nav {
          margin: 0;
          padding: 0 15px;
          border-bottom: 1px solid #e8e8e8;
        }
        .custom-tabs-header .ant-tabs-tab {
          color: #666;
          font-size: 14px;
        }
        .custom-tabs-header .ant-tabs-tab:hover {
          color: #1890ff;
        }
        .custom-tabs-header .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #1890ff;
          font-weight: 600;
        }
        .custom-tabs-header .ant-tabs-ink-bar {
          background: #1890ff;
          height: 2px;
        }
        .custom-tabs-header .ant-tabs-content-holder {
          padding: 12px;
        }
      `}</style>
      <Tabs
        defaultActiveKey="1"
        className="custom-tabs-header"
        items={[
          {
            key: "1",
            label: "Xác định phần",
            children: (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                    1
                  </div>
                  <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Định dạng PHẦN trong đề thi</h3>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                  Sử dụng định dạng: <strong>"PHẦN"</strong> + <strong>"khoảng cách"</strong> + <strong>"số phần"</strong> +{" "}
                  <strong>"khoảng cách"</strong> + <strong>"tính chất của phần"</strong> + <strong>"nội dung còn lại khác của phần"</strong>
                </p>
                <div className="ml-11 bg-pink-50 dark:bg-rose-900/20 border-l-4 border-red-500 rounded p-3">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Ví dụ:</p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                    <li>PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn</li>
                    <li>PHẦN II. Câu trắc nghiệm đúng sai</li>
                    <li>Phần III. Câu trắc nghiệm trả lời ngắn</li>
                    <li>Phần IV. Tự luận.</li>
                    <li>PHẦN 1. Trắc nghiệm nhiều</li>
                    <li>PHẦN 2. Trắc nghiệm đúng sai</li>
                    <li>PHẦN III. Trả lời ngắn</li>
                    <li>Phần I. Trắc nghiệm:</li>
                    <li>PHẦN 4: Trắc nghiệm nhiều đáp án</li>
                    <li>
                      PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn. Thí sinh trả lời từ câu 1 đến câu 12. Mỗi câu hỏi thí sinh chỉ chọn một phương
                      án.
                    </li>
                  </ul>
                </div>
              </div>
            ),
          },
          {
            key: "2",
            label: "Câu hỏi & Đáp án",
            children: (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      1
                    </div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Xác định câu hỏi</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                    Sử dụng định dạng: <strong>"Câu"</strong> + <strong>"khoảng trắng"</strong> + <strong>"số câu."</strong> +{" "}
                    <strong>"khoảng trắng"</strong>
                  </p>
                  <div className="ml-11 bg-pink-50 dark:bg-rose-900/20 border-l-4 border-red-500 rounded p-3">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Ví dụ:</p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li>Câu 1. Nội dung câu hỏi...</li>
                      <li>Câu 2: Nội dung câu hỏi...</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      2
                    </div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Xác định đáp án</h3>
                  </div>
                  <div className="ml-11 space-y-3">
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Phần nhiều phương án lựa chọn:</strong> Sử dụng chữ cái in hoa + dấu chấm + khoảng trắng
                      </p>
                      <div className="bg-pink-50 dark:bg-rose-900/20 border-l-4 border-red-500 rounded p-3">
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Ví dụ:</p>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                          <li>A. Nội dung đáp án thứ nhất...</li>
                          <li>B. Nội dung đáp án thứ hai...</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Phần đúng sai:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">Sử dụng chữ cái thường + dấu ngoặc đơn + khoảng trắng</p>
                      <div className="bg-pink-50 dark:bg-rose-900/20 border-l-4 border-red-500 rounded p-3">
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Ví dụ:</p>
                        <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                          <li>a) Nhận định 1...</li>
                          <li>b) Nhận định 2...</li>
                          <li>c) Nhận định 3...</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "3",
            label: "Đáp án đúng",
            children: (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      1
                    </div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Phần I (Nhiều phương án lựa chọn)</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">Gạch chân hoặc tô màu khác loại đáp án đúng.</p>
                  <div className="ml-11 bg-pink-50 dark:bg-rose-900/20 border-l-4 border-red-500 rounded p-3">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Ví dụ:</p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li>A. B. C. D. (với B được gạch chân)</li>
                      <li>A. B. C. D. (với C được gạch chân)</li>
                      <li>A. B. C. D. (với B được tô màu đỏ)</li>
                      <li>A. B. C. D. (với D được tô màu xanh)</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      2
                    </div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Phần II (Đúng sai)</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">Chỉ gạch chân, không tô màu để xác định đáp án đúng.</p>
                  <div className="ml-11 bg-pink-50 dark:bg-rose-900/20 border-l-4 border-red-500 rounded p-3">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Ví dụ:</p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li>a) b) c) d) (với a) và d) được gạch chân)</li>
                    </ul>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      3
                    </div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">
                      Phần III (Trả lời ngắn hoặc tự luận có duy nhất một kết quả, đáp án)
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                    Sử dụng chữ cái in hoa + dấu chấm + khoảng trắng để xác định kết quả đúng.
                  </p>
                  <div className="ml-11 bg-pink-50 dark:bg-rose-900/20 border-l-4 border-red-500 rounded p-3">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Ví dụ:</p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li>A. 22,4</li>
                    </ul>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "4",
            label: "Tiếng Anh",
            children: (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      1
                    </div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Đề thi Tiếng Anh</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                    Sử dụng từ khóa <strong>"Question"</strong> thay vì <strong>"Câu"</strong> để xác định câu hỏi
                  </p>
                  <div className="ml-11 bg-pink-50 dark:bg-rose-900/20 border-l-4 border-red-500 rounded p-3">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Ví dụ:</p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li>Question 1. What is your name?</li>
                      <li>Question 2: How old are you?</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      2
                    </div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Định dạng, xác định PHẦN</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                    Đặt các thẻ <strong>&lt;g&gt;</strong> trước các phần trong đề. Một phần được định nghĩa là gồm Yêu cầu ở phía trên và danh sách
                    câu hỏi phục vụ cho yêu cầu đó ở phía dưới.
                  </p>
                  <div className="ml-11 bg-pink-50 dark:bg-rose-900/20 border-l-4 border-red-500 rounded p-3">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Ví dụ:</p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li>Khi trộn thì vị trí các phần trong đề sẽ được hoán vị.</li>
                      <li>
                        Nếu muốn giữ nguyên vị trí của phần nào đó thì thầy cô chỉ cần thêm dấu <strong>#</strong> ngay trước{" "}
                        <strong>&lt;g&gt;</strong> ví dụ như: <strong>&lt;#g0&gt;</strong>, <strong>&lt;#g1&gt;</strong>, <strong>&lt;#g2&gt;</strong>
                        , <strong>&lt;#g3&gt;</strong>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      3
                    </div>
                    <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">Tính chất trộn các câu hỏi và đáp án trong 1 phần</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                    Sử dụng số trong các thẻ <strong>&lt;g&gt;</strong> để xác định tính chất trộn cho các câu hỏi và đáp án trong phần:
                  </p>
                  <div className="ml-11 bg-pink-50 dark:bg-rose-900/20 border-l-4 border-red-500 rounded p-3">
                    <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Ví dụ:</p>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 list-disc list-inside">
                      <li>
                        <strong>&lt;g0&gt;</strong>: Không trộn các câu hỏi lẫn đáp án của mỗi câu hỏi trong phần.
                      </li>
                      <li>
                        <strong>&lt;g1&gt;</strong>: Chỉ hoán vị vị trí các câu hỏi trong phần còn vị trí các đáp án của các câu hỏi sẽ giữ nguyên.
                      </li>
                      <li>
                        <strong>&lt;g2&gt;</strong>: Chỉ hoán vị vị trí các đáp án, vị trí các câu hỏi trong phần sẽ giữ nguyên.
                      </li>
                      <li>
                        <strong>&lt;g3&gt;</strong>: Hoán vị cả câu hỏi lẫn đáp án trong phần.
                      </li>
                      <li>
                        <strong>&lt;#g0&gt;</strong>: Giữ nguyên vị trí phần trong đề + không trộn.
                      </li>
                      <li>
                        <strong>&lt;#g1&gt;</strong>: Giữ nguyên vị trí phần trong đề + hoán vị các câu hỏi, giữ nguyên vị trí các đáp án trong câu
                        hỏi.
                      </li>
                      <li>
                        <strong>&lt;#g2&gt;</strong>: Giữ nguyên vị trí phần trong đề + hoán vị các đáp án trong câu hỏi, vị trí các câu hỏi trong
                        phần được giữ nguyên.
                      </li>
                      <li>
                        <strong>&lt;#g3&gt;</strong>: Giữ nguyên vị trí phần trong đề + hoán vị các câu hỏi và đáp án trong phần.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: "5",
            label: "Lỗi định dạng",
            children: (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      1
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Thiếu (.), (:), ")" và khoảng trắng</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                    Đằng sau các từ khóa quan trọng như "Câu 1. "; "Phần I. "; "Question 1. "; "A. "; "a) " thì cần có đầy đủ dấu và khoảng trắng.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      2
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Để tất cả các hình ảnh dưới dạng In Line with Text</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                    Để tránh vị trí hình ảnh bị sai lệch hoặc mất mát thì khi soạn đề các thầy cô cần để các hình ảnh trong đề dưới dạng In Line with
                    Text.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      3
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Lỗi trong quá trình định dạng đáp án đúng</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                    Khi sử dụng màu để xác định đáp án đúng, thầy cô cần đảm bảo màu của đáp án đúng là duy nhất và khác biệt so với các đáp án sai
                    khác.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      4
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Thiếu xuống dòng</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                    Khi sang phần mới, câu hỏi mới hoặc khi chuyển từ nội dung câu hỏi sau nội dung các đáp án lựa chọn thì cần xuống dòng bằng Enter.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      5
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Loại bỏ các định dạng lạ, thừa</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                    Để tránh những lỗi nhận dạng, thầy cô cần loại bỏ các định dạng lạ, định dạng ảnh hưởng trực tiếp đến các "từ khóa" quan trọng
                    trong đề trộn.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      6
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Loại bỏ các phông chữ, kiểu chữ lạ</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                    Để tránh việc hiển thị phông chữ, kiểu chữ (Styles) xấu, sai lệch trong đề sau khi trộn ra thì nên sử dụng phông Times New Roman
                    và kiểu chữ Normal.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-linear-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shrink-0">
                      7
                    </div>
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Loại bỏ định dạng bảng (Table) không đúng vị trí</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 ml-11">
                    TNMix chỉ chấp nhận và nhận diện được nếu thầy cô sử dụng định dạng bảng (Table) để đóng gói nội dung các đáp án mà thôi.
                  </p>
                </div>
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
