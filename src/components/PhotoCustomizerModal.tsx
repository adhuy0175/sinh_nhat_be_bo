import React, { useState } from 'react';
import { X, Upload, Check, RotateCcw, Copy, Info, Plus, Trash2, Star } from 'lucide-react';
import { MemoryPhoto, BIRTHDAY_CONFIG } from '../config/birthdayConfig';

interface PhotoCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: MemoryPhoto[];
  onUpdatePhotos: (updated: MemoryPhoto[]) => void;
  onResetPhotos: () => void;
}

export const PhotoCustomizerModal: React.FC<PhotoCustomizerModalProps> = ({
  isOpen,
  onClose,
  photos,
  onUpdatePhotos,
  onResetPhotos,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'guide'>('upload');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleImageFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const updated = [...photos];
        updated[index] = {
          ...updated[index],
          url: result,
        };
        onUpdatePhotos(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleFilesAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotosList = [...photos];
    const fileArray = Array.from(files);

    let loadedCount = 0;
    fileArray.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        newPhotosList.push({
          id: `mem-${Date.now()}-${idx}`,
          url: result,
          title: `Khoảnh khắc xinh đẹp #${newPhotosList.length + 1}`,
          caption: 'Nụ cười dịu dàng làm say đắm trái tim anh.',
          aspectRatio: 'portrait',
          sticker: '💖',
        });
        loadedCount++;
        if (loadedCount === fileArray.length) {
          onUpdatePhotos(newPhotosList);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSetAsCover = (index: number) => {
    const selected = photos[index];
    if (selected) {
      BIRTHDAY_CONFIG.scene3.coverPhoto = {
        url: selected.url,
        title: selected.title,
        caption: selected.caption,
      };
      // Move it to first position or mark it
      const remaining = photos.filter((_, i) => i !== index);
      onUpdatePhotos([selected, ...remaining]);
    }
  };

  const handleDeletePhoto = (index: number) => {
    if (photos.length <= 1) return;
    const updated = photos.filter((_, i) => i !== index);
    onUpdatePhotos(updated);
  };

  const handleCaptionChange = (index: number, newCaption: string) => {
    const updated = [...photos];
    updated[index] = {
      ...updated[index],
      caption: newCaption,
    };
    onUpdatePhotos(updated);
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    const updated = [...photos];
    updated[index] = {
      ...updated[index],
      title: newTitle,
    };
    onUpdatePhotos(updated);
  };

  const copyConfigSnippet = () => {
    const cleanSnippet = JSON.stringify(
      photos.map((p) => ({
        id: p.id,
        url: p.url.startsWith('data:') ? `/photos/${p.id}.jpg` : p.url,
        title: p.title,
        caption: p.caption,
        aspectRatio: p.aspectRatio,
        sticker: p.sticker,
      })),
      null,
      2
    );
    navigator.clipboard?.writeText(cleanSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-rose-100 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-2">
              <span>Quản lý & Tải ảnh sinh nhật của em</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Chọn ảnh từ máy để cập nhật ngay, đặt ảnh bìa chính và viết lời nhắn yêu thương
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-stone-100 px-6 pt-2 bg-stone-50/50">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Danh sách ảnh ({photos.length} ảnh)
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-4 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Hướng dẫn lưu vào dự án vĩnh viễn
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              {/* Batch Upload Header Action */}
              <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-rose-900">
                  <Info className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Bạn có thể chọn nhiều ảnh cùng lúc từ điện thoại hoặc máy tính để tự động mở rộng cuốn sổ kỷ niệm!
                  </span>
                </div>

                <label className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-full shadow-sm cursor-pointer transition-transform hover:scale-105">
                  <Plus className="w-4 h-4" />
                  <span>Chọn thêm nhiều ảnh</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleMultipleFilesAdd}
                  />
                </label>
              </div>

              {/* Photos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {photos.map((photo, idx) => {
                  const isFirst = idx === 0;

                  return (
                    <div
                      key={photo.id || idx}
                      className={`p-3.5 rounded-2xl border flex gap-3 items-center relative ${
                        isFirst
                          ? 'border-amber-300 bg-amber-50/40 shadow-sm'
                          : 'border-stone-200 bg-stone-50/60'
                      }`}
                    >
                      {/* Preview box */}
                      <div className="relative w-22 h-22 rounded-xl overflow-hidden bg-rose-100 shrink-0 border border-rose-200 flex items-center justify-center">
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <label className="absolute inset-0 bg-stone-900/40 hover:bg-stone-900/60 text-white flex flex-col items-center justify-center cursor-pointer transition-colors opacity-90 hover:opacity-100">
                          <Upload className="w-4 h-4 mb-0.5" />
                          <span className="text-[9px] font-medium">Thay ảnh</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageFileChange(idx, e)}
                          />
                        </label>
                      </div>

                      {/* Inputs & Actions */}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-rose-600">
                              Ảnh #{idx + 1}
                            </span>
                            {isFirst && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[9px] font-bold">
                                Bìa chính
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {!isFirst && (
                              <button
                                onClick={() => handleSetAsCover(idx)}
                                title="Đặt bức ảnh này làm ảnh bìa chính của cuốn sổ"
                                className="p-1 text-stone-400 hover:text-amber-500 rounded hover:bg-amber-50 text-[10px] flex items-center gap-0.5"
                              >
                                <Star className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Làm bìa</span>
                              </button>
                            )}

                            {photos.length > 1 && (
                              <button
                                onClick={() => handleDeletePhoto(idx)}
                                title="Xóa bức ảnh này"
                                className="p-1 text-stone-400 hover:text-rose-500 rounded hover:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <input
                          type="text"
                          value={photo.title}
                          onChange={(e) => handleTitleChange(idx, e.target.value)}
                          placeholder="Tiêu đề ảnh..."
                          className="w-full text-xs px-2.5 py-1 bg-white rounded-lg border border-stone-200 focus:border-rose-400 outline-none"
                        />

                        <input
                          type="text"
                          value={photo.caption}
                          onChange={(e) => handleCaptionChange(idx, e.target.value)}
                          placeholder="Lời chúc / ghi chú..."
                          className="w-full text-xs px-2.5 py-1 bg-white rounded-lg border border-stone-200 focus:border-rose-400 outline-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-stone-700 leading-relaxed">
              <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-200">
                <h4 className="font-semibold text-stone-900 mb-2">
                  Cách đưa ảnh tĩnh của hai bạn vào mã nguồn để bạn gái xem trên mọi thiết bị:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-stone-700">
                  <li>
                    Đặt ảnh đẹp nhất làm ảnh bìa tại:
                    <div className="mt-1 font-mono text-xs bg-white p-2 rounded-lg border border-rose-200">
                      /public/photos/cover.jpg
                    </div>
                  </li>
                  <li>
                    Đặt các tấm ảnh còn lại vào thư mục <code>public/photos/</code>:
                    <div className="mt-1 font-mono text-xs bg-white p-2 rounded-lg border border-rose-200">
                      /public/photos/memory-01.jpg<br />
                      /public/photos/memory-02.jpg ... đến memory-12.jpg
                    </div>
                  </li>
                  <li>
                    Mở tệp tin <code className="text-rose-600 font-semibold">src/config/birthdayConfig.ts</code> để tùy chỉnh tên bạn gái, lời chúc và chú thích cho từng bức ảnh.
                  </li>
                  <li>
                    File nhạc nền "Thế Giới Của Anh" có thể đặt tại <code>public/music/the-gioi-cua-anh.mp3</code> để trang web tự động phát!
                  </li>
                </ol>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <span className="text-xs text-stone-500 font-medium">Đoạn cấu hình JSON ảnh hiện tại:</span>
                <button
                  onClick={copyConfigSnippet}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Đã sao chép' : 'Sao chép đoạn JSON'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <button
            onClick={onResetPhotos}
            className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-600 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục ảnh mẫu</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-full shadow transition-all cursor-pointer"
          >
            Hoàn tất & Ngắm trang web ✨
          </button>
        </div>
      </div>
    </div>
  );
};
