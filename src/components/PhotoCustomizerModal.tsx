import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Check,
  RotateCcw,
  Copy,
  Info,
  Plus,
  Trash2,
  Star,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  FileCode,
  HelpCircle,
} from 'lucide-react';
import { MemoryPhoto, BIRTHDAY_CONFIG } from '../config/birthdayConfig';

interface PhotoCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: MemoryPhoto[];
  onUpdatePhotos: (updated: MemoryPhoto[]) => void;
  onResetPhotos: () => void;
}

// Master passcode for owner/creator to edit photos (default: 2110 - birthday date)
const DEFAULT_PASSCODE = '2110';
const AUTH_SESSION_KEY = 'birthday_photo_editor_unlocked_v1';

export const PhotoCustomizerModal: React.FC<PhotoCustomizerModalProps> = ({
  isOpen,
  onClose,
  photos,
  onUpdatePhotos,
  onResetPhotos,
}) => {
  // Authentication & privacy state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  // Draft photos state (changes commit only on "Lưu thay đổi")
  const [draftPhotos, setDraftPhotos] = useState<MemoryPhoto[]>(photos);
  const [coverPhotoIndex, setCoverPhotoIndex] = useState<number>(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Filter & tab controls
  const [filterTab, setFilterTab] = useState<'all' | 'uploaded' | 'placeholders'>('all');
  const [showDeployGuide, setShowDeployGuide] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Drag & drop and upload feedback
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Deletion confirmation state: holds photo id pending deletion
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  // Reset confirmation state
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const mainFileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize draft when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftPhotos(photos);
      setHasUnsavedChanges(false);
      setSaveSuccessMessage(null);
      setPendingDeleteId(null);
      setShowResetConfirm(false);

      // Check session unlock status
      const unlocked = sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
      setIsUnlocked(unlocked);
      setPasscodeInput('');
      setPasscodeError(null);

      // Find cover photo index
      const coverUrl = BIRTHDAY_CONFIG.scene3.coverPhoto.url;
      const foundIdx = photos.findIndex((p) => p.url === coverUrl);
      setCoverPhotoIndex(foundIdx >= 0 ? foundIdx : 0);
    }
  }, [isOpen, photos]);

  // Handle Passcode Unlock
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === DEFAULT_PASSCODE) {
      setIsUnlocked(true);
      setPasscodeError(null);
      try {
        sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      } catch {
        // Ignore
      }
    } else {
      setPasscodeError('Mã bảo mật chưa chính xác. Vui lòng thử lại!');
    }
  };

  const handleLockSession = () => {
    setIsUnlocked(false);
    try {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
    } catch {
      // Ignore
    }
  };

  if (!isOpen) return null;

  // ---------------------------------------------------------------------------
  // PASSCODE GATE (VISITOR PRIVACY REQUIREMENT)
  // ---------------------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl border border-rose-100 p-7 text-center space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Lock Icon Badge */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Khu vực quản lý ảnh riêng tư
            </h3>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              Trang web quà tặng sinh nhật dành riêng cho bạn gái. Vui lòng nhập mã bảo mật để mở khóa quyền chỉnh sửa ảnh.
            </p>
          </div>

          <form onSubmit={handleVerifyPasscode} className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                value={passcodeInput}
                onChange={(e) => {
                  setPasscodeInput(e.target.value);
                  setPasscodeError(null);
                }}
                placeholder="Nhập mã bảo mật (PIN)..."
                autoFocus
                className="w-full text-center text-lg tracking-widest px-4 py-2.5 rounded-xl border border-stone-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all font-mono"
              />
              {passcodeError && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{passcodeError}</span>
                </p>
              )}
              <p className="text-[11px] text-stone-400 mt-2">
                Gợi ý: Ngày sinh nhật của em (<span className="font-semibold text-rose-500">2110</span>)
              </p>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 text-xs font-medium text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-xs font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Mở khóa chỉnh sửa</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // PHOTO MANIPULATION HANDLERS
  // ---------------------------------------------------------------------------

  // Read single/multiple files helper
  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(file.name)
    );

    if (fileArray.length === 0) {
      alert('Vui lòng chọn tệp ảnh hợp lệ (JPEG, PNG, WebP).');
      return;
    }

    setUploadProgress(`Đang xử lý ${fileArray.length} ảnh...`);

    const newPhotosList: MemoryPhoto[] = [...draftPhotos];
    let loadedCount = 0;

    fileArray.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const cleanName = file.name.replace(/\.[^/.]+$/, '');

        // Determine orientation based on natural aspect ratio if possible
        const img = new Image();
        img.onload = () => {
          let ratio: 'portrait' | 'landscape' | 'square' = 'portrait';
          if (img.width > img.height * 1.15) ratio = 'landscape';
          else if (Math.abs(img.width - img.height) < 40) ratio = 'square';

          newPhotosList.push({
            id: `mem-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
            url: result,
            title: cleanName.length > 2 ? cleanName : `Khoảnh khắc đáng yêu #${newPhotosList.length + 1}`,
            caption: 'Nụ cười dịu dàng làm bừng sáng cả bầu trời của anh.',
            aspectRatio: ratio,
            sticker: '💖',
          });

          loadedCount++;
          setUploadProgress(`Đã đọc ${loadedCount} / ${fileArray.length} ảnh...`);

          if (loadedCount === fileArray.length) {
            setDraftPhotos([...newPhotosList]);
            setHasUnsavedChanges(true);
            setUploadProgress(null);
          }
        };
        img.onerror = () => {
          newPhotosList.push({
            id: `mem-${Date.now()}-${idx}`,
            url: result,
            title: cleanName.length > 2 ? cleanName : `Khoảnh khắc xinh đẹp #${newPhotosList.length + 1}`,
            caption: 'Nụ cười dịu dàng làm bừng sáng cả bầu trời của anh.',
            aspectRatio: 'portrait',
            sticker: '💖',
          });

          loadedCount++;
          if (loadedCount === fileArray.length) {
            setDraftPhotos([...newPhotosList]);
            setHasUnsavedChanges(true);
            setUploadProgress(null);
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Replace photo on a specific card
  const handleReplaceSinglePhoto = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const updated = [...draftPhotos];
        updated[index] = {
          ...updated[index],
          url: result,
        };
        setDraftPhotos(updated);
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Set photo as Cover Photo
  const handleSetCoverPhoto = (index: number) => {
    setCoverPhotoIndex(index);
    setHasUnsavedChanges(true);
  };

  // Reorder Up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...draftPhotos];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;

    // Adjust cover photo index if affected
    if (coverPhotoIndex === index) {
      setCoverPhotoIndex(index - 1);
    } else if (coverPhotoIndex === index - 1) {
      setCoverPhotoIndex(index);
    }

    setDraftPhotos(updated);
    setHasUnsavedChanges(true);
  };

  // Reorder Down
  const handleMoveDown = (index: number) => {
    if (index >= draftPhotos.length - 1) return;
    const updated = [...draftPhotos];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;

    // Adjust cover photo index if affected
    if (coverPhotoIndex === index) {
      setCoverPhotoIndex(index + 1);
    } else if (coverPhotoIndex === index + 1) {
      setCoverPhotoIndex(index);
    }

    setDraftPhotos(updated);
    setHasUnsavedChanges(true);
  };

  // Request Delete with inline confirmation
  const handleConfirmDelete = (id: string) => {
    if (draftPhotos.length <= 1) {
      alert('Bộ sưu tập cần giữ lại ít nhất 1 bức ảnh.');
      return;
    }
    const deleteIdx = draftPhotos.findIndex((p) => p.id === id);
    const updated = draftPhotos.filter((p) => p.id !== id);

    // Adjust cover photo index
    if (coverPhotoIndex === deleteIdx) {
      setCoverPhotoIndex(0);
    } else if (coverPhotoIndex > deleteIdx) {
      setCoverPhotoIndex(coverPhotoIndex - 1);
    }

    setDraftPhotos(updated);
    setPendingDeleteId(null);
    setHasUnsavedChanges(true);
  };

  // Input changes
  const handleTitleChange = (index: number, val: string) => {
    const updated = [...draftPhotos];
    updated[index] = { ...updated[index], title: val };
    setDraftPhotos(updated);
    setHasUnsavedChanges(true);
  };

  const handleCaptionChange = (index: number, val: string) => {
    const updated = [...draftPhotos];
    updated[index] = { ...updated[index], caption: val };
    setDraftPhotos(updated);
    setHasUnsavedChanges(true);
  };

  // Drag and drop events for the main dropzone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Save changes
  const handleSaveChanges = () => {
    // Commit the cover photo to BIRTHDAY_CONFIG
    const selectedCover = draftPhotos[coverPhotoIndex] || draftPhotos[0];
    if (selectedCover) {
      BIRTHDAY_CONFIG.scene3.coverPhoto = {
        url: selectedCover.url,
        title: selectedCover.title,
        caption: selectedCover.caption,
      };
      try {
        localStorage.setItem(
          'birthday_cover_photo_v1',
          JSON.stringify(BIRTHDAY_CONFIG.scene3.coverPhoto)
        );
      } catch {
        // Ignore
      }
    }

    // Commit photos to parent App state & localStorage
    onUpdatePhotos(draftPhotos);
    setHasUnsavedChanges(false);

    // Display clear success message
    setSaveSuccessMessage(`Đã lưu thành công ${draftPhotos.length} bức ảnh vào bộ nhớ! ✨`);
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 4500);
  };

  // Reset to default sample photos
  const handleConfirmReset = () => {
    onResetPhotos();
    setDraftPhotos(BIRTHDAY_CONFIG.scene3.photos);
    setCoverPhotoIndex(0);
    setHasUnsavedChanges(false);
    setShowResetConfirm(false);
    setSaveSuccessMessage('Đã khôi phục danh sách ảnh mẫu ban đầu.');
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 3000);
  };

  // Copy JSON configuration snippet
  const copyConfigSnippet = () => {
    const cleanSnippet = JSON.stringify(
      draftPhotos.map((p) => ({
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
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Calculate stats for filter tabs
  const isUploadedPhoto = (url: string) => url.startsWith('data:') || url.startsWith('blob:');
  const uploadedCount = draftPhotos.filter((p) => isUploadedPhoto(p.url)).length;
  const placeholderCount = draftPhotos.length - uploadedCount;

  // Filtered photos to display
  const displayedPhotos = draftPhotos.filter((photo) => {
    if (filterTab === 'uploaded') return isUploadedPhoto(photo.url);
    if (filterTab === 'placeholders') return !isUploadedPhoto(photo.url);
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-950/65 backdrop-blur-sm overflow-x-hidden"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[88vh] bg-white rounded-3xl shadow-2xl border border-rose-100 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================= */}
        {/* 1. FIXED HEADER                                                   */}
        {/* ================================================================= */}
        <div className="px-6 py-4.5 border-b border-rose-100 bg-[#fffdfc] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0 shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
                  Quản Lý Ảnh Kỷ Niệm Sinh Nhật
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold">
                  {draftPhotos.length} ảnh
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Đã mở khóa</span>
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5 hidden sm:block">
                Tùy chỉnh kho ảnh sinh nhật, chọn ảnh bìa và thêm lời nhắn yêu thương cho công chúa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLockSession}
              title="Khóa lại quyền chỉnh sửa"
              className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">Khóa lại</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Đóng cửa sổ"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Guide Tabs Bar */}
        <div className="px-6 py-2.5 bg-stone-50/70 border-b border-stone-100 flex items-center justify-between gap-3 flex-wrap shrink-0">
          {/* Filter options */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-stone-400 text-[11px] mr-1 hidden sm:inline">Xem:</span>
            <button
              onClick={() => {
                setFilterTab('all');
                setShowDeployGuide(false);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterTab === 'all' && !showDeployGuide
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              Tất cả ({draftPhotos.length})
            </button>
            <button
              onClick={() => {
                setFilterTab('uploaded');
                setShowDeployGuide(false);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterTab === 'uploaded' && !showDeployGuide
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              Đã thay ảnh ({uploadedCount})
            </button>
            <button
              onClick={() => {
                setFilterTab('placeholders');
                setShowDeployGuide(false);
              }}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                filterTab === 'placeholders' && !showDeployGuide
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              Ảnh mẫu ({placeholderCount})
            </button>
          </div>

          {/* Guide / Deploy toggle */}
          <button
            onClick={() => setShowDeployGuide(!showDeployGuide)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg border transition-all cursor-pointer font-medium ${
              showDeployGuide
                ? 'bg-rose-100 border-rose-300 text-rose-800'
                : 'bg-white border-stone-200/80 text-stone-600 hover:text-rose-600 hover:border-rose-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>{showDeployGuide ? 'Quay lại danh sách' : 'Hướng dẫn lưu vĩnh viễn & Deploy'}</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* 2. SCROLLABLE CONTENT AREA                                        */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-[#faf8f7]">
          {/* Guide Tab View */}
          {showDeployGuide ? (
            <div className="space-y-4 max-w-3xl mx-auto py-2">
              <div className="p-5 bg-white rounded-2xl border border-rose-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
                  <Info className="w-4 h-4" />
                  <h4>Minh bạch về lưu trữ ảnh (Visitor Privacy & Build Workflow)</h4>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Các ảnh bạn tải lên qua trình duyệt sẽ được lưu vào <code className="bg-rose-50 text-rose-700 px-1 py-0.5 rounded">localStorage</code> trên thiết bị hiện tại của bạn. Để bạn gái có thể mở link và xem được toàn bộ ảnh trên điện thoại của cô ấy (hoặc bất kỳ thiết bị nào khác), hãy đưa ảnh thật vào thư mục mã nguồn trước khi deploy:
                </p>

                <div className="space-y-2 pt-1 text-xs text-stone-700">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 font-mono space-y-1.5">
                    <p className="text-stone-500 font-sans font-medium">1. Ảnh bìa đẹp nhất:</p>
                    <p className="text-rose-600">/public/photos/cover.jpg</p>
                    <p className="text-stone-500 font-sans font-medium pt-1">2. Các ảnh kỷ niệm khác:</p>
                    <p className="text-rose-600">/public/photos/memory-01.jpg ... memory-12.jpg</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs text-stone-500">
                    Cấu hình JSON tương ứng với các ảnh hiện tại:
                  </span>
                  <button
                    onClick={copyConfigSnippet}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Đã sao chép' : 'Sao chép đoạn JSON'}</span>
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setShowDeployGuide(false)}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Quay lại chỉnh sửa ảnh
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Honest storage explanation notice banner */}
              <div className="p-3.5 bg-rose-50/60 border border-rose-200/70 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
                <Info className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <p className="font-semibold text-rose-950">Lưu ý về lưu trữ ảnh:</p>
                  <p className="text-stone-600 mt-0.5">
                    Ảnh tải lên được lưu trong bộ nhớ trình duyệt của thiết bị này. Sau khi chỉnh sửa xong, hãy bấm{' '}
                    <strong className="text-rose-700">"Lưu thay đổi"</strong> ở góc dưới để áp dụng ngay vào website.
                  </p>
                </div>
              </div>

              {/* Multi-file Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => mainFileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 ${
                  isDraggingOver
                    ? 'border-rose-500 bg-rose-100/60 scale-[1.008]'
                    : 'border-rose-200 hover:border-rose-400 bg-white hover:bg-rose-50/40 shadow-xs'
                }`}
              >
                <input
                  ref={mainFileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/heic,image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) processFiles(e.target.files);
                    e.target.value = '';
                  }}
                />

                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
                  <Upload className="w-5 h-5" />
                </div>

                <div>
                  <p className="font-medium text-stone-800 text-xs sm:text-sm">
                    Kéo thả ảnh vào đây hoặc <span className="text-rose-600 underline">chọn từ thiết bị</span>
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Hỗ trợ tải nhiều ảnh cùng lúc · Định dạng JPEG, PNG, WebP · Giữ nguyên tỉ lệ tự nhiên
                  </p>
                </div>

                {uploadProgress && (
                  <div className="mt-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium animate-pulse">
                    {uploadProgress}
                  </div>
                )}
              </div>

              {/* Photo Cards Grid: 2 Columns on Desktop, 1 on Mobile */}
              {displayedPhotos.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-stone-200/80 p-6">
                  <ImageIcon className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                  <p className="text-sm font-medium text-stone-700">Không tìm thấy ảnh phù hợp bộ lọc</p>
                  <button
                    onClick={() => setFilterTab('all')}
                    className="mt-2 text-xs text-rose-600 font-medium underline cursor-pointer"
                  >
                    Xem tất cả ảnh
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {displayedPhotos.map((photo) => {
                    const originalIndex = draftPhotos.findIndex((p) => p.id === photo.id);
                    const isCover = originalIndex === coverPhotoIndex;
                    const isCustomUploaded = isUploadedPhoto(photo.url);

                    return (
                      <div
                        key={photo.id || originalIndex}
                        className={`rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col justify-between relative bg-white ${
                          isCover
                            ? 'border-amber-300 ring-2 ring-amber-200/70 shadow-sm bg-gradient-to-br from-amber-50/30 to-white'
                            : 'border-stone-200/80 hover:border-rose-200 shadow-xs'
                        }`}
                      >
                        {/* Top Card Bar: Number, Cover Badge, Actions */}
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-stone-800">
                              Ảnh #{originalIndex + 1}
                            </span>
                            {isCover && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-bold shadow-xs">
                                <Star className="w-3 h-3 fill-white" />
                                <span>Ảnh bìa chính</span>
                              </span>
                            )}
                            {isCustomUploaded ? (
                              <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] font-medium border border-rose-100">
                                Ảnh của bạn
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 text-[10px] font-medium">
                                Ảnh mẫu
                              </span>
                            )}
                          </div>

                          {/* Quick Card Actions */}
                          <div className="flex items-center gap-1">
                            {!isCover && (
                              <button
                                onClick={() => handleSetCoverPhoto(originalIndex)}
                                title="Đặt bức ảnh này làm ảnh bìa chính của album"
                                className="px-2 py-1 text-[11px] font-medium text-stone-600 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Star className="w-3 h-3" />
                                <span className="hidden sm:inline">Làm bìa</span>
                              </button>
                            )}

                            {/* Reorder controls */}
                            <button
                              onClick={() => handleMoveUp(originalIndex)}
                              disabled={originalIndex === 0}
                              title="Di chuyển lên trước"
                              className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20 disabled:hover:text-stone-400 rounded hover:bg-stone-100 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleMoveDown(originalIndex)}
                              disabled={originalIndex === draftPhotos.length - 1}
                              title="Di chuyển xuống sau"
                              className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20 disabled:hover:text-stone-400 rounded hover:bg-stone-100 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete trigger */}
                            <button
                              onClick={() => setPendingDeleteId(photo.id)}
                              title="Xóa bức ảnh này"
                              className="p-1 text-stone-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer ml-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Deletion Confirmation Prompt */}
                        {pendingDeleteId === photo.id && (
                          <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-800 animate-fadeIn">
                            <span>Xác nhận xóa ảnh #{originalIndex + 1}?</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleConfirmDelete(photo.id)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium text-[11px] cursor-pointer"
                              >
                                Xóa
                              </button>
                              <button
                                onClick={() => setPendingDeleteId(null)}
                                className="px-2 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded font-medium text-[11px] cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Card Body: Thumbnail & Inputs */}
                        <div className="flex gap-3.5 items-start">
                          {/* Photo Thumbnail with hover replace */}
                          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 group flex items-center justify-center">
                            <img
                              src={photo.url}
                              alt={photo.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            {/* Hover overlay to change image */}
                            <label className="absolute inset-0 bg-stone-950/50 hover:bg-stone-950/65 text-white flex flex-col items-center justify-center cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <Upload className="w-4 h-4 mb-1" />
                              <span className="text-[10px] font-medium">Đổi ảnh</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/*"
                                onClick={(e) => {
                                  (e.target as HTMLInputElement).value = '';
                                }}
                                onChange={(e) => handleReplaceSinglePhoto(originalIndex, e)}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {/* Editable Fields */}
                          <div className="flex-1 space-y-2 min-w-0">
                            <div>
                              <label className="text-[11px] font-medium text-stone-500 block mb-1">
                                Tiêu đề ảnh
                              </label>
                              <input
                                type="text"
                                value={photo.title}
                                onChange={(e) => handleTitleChange(originalIndex, e.target.value)}
                                placeholder="Nhập tiêu đề..."
                                className="w-full text-xs px-2.5 py-1.5 bg-stone-50/50 focus:bg-white rounded-lg border border-stone-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 outline-none transition-all"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-medium text-stone-500 block mb-1">
                                Lời nhắn / Ghi chú
                              </label>
                              <textarea
                                value={photo.caption}
                                onChange={(e) => handleCaptionChange(originalIndex, e.target.value)}
                                placeholder="Ghi chú kỷ niệm hoặc lời chúc yêu thương..."
                                rows={2}
                                className="w-full text-xs px-2.5 py-1.5 bg-stone-50/50 focus:bg-white rounded-lg border border-stone-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 outline-none resize-y min-h-[52px] leading-relaxed transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* ================================================================= */}
        {/* 3. CLEAN STICKY FOOTER                                            */}
        {/* ================================================================= */}
        <div className="px-6 py-4 bg-[#fffdfc] border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Left: Subtle Secondary Action (Khôi phục ảnh mẫu with confirmation) */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            {showResetConfirm ? (
              <div className="flex items-center gap-1.5 text-xs bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-800 animate-fadeIn">
                <span>Khôi phục về ảnh mẫu ban đầu?</span>
                <button
                  onClick={handleConfirmReset}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-medium cursor-pointer"
                >
                  Đồng ý
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded text-[11px] font-medium cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-rose-600 px-3 py-1.5 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục ảnh mẫu</span>
              </button>
            )}

            {/* Unsaved status badge */}
            {hasUnsavedChanges && !saveSuccessMessage && (
              <span className="text-[11px] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60 font-medium">
                ● Có thay đổi chưa lưu
              </span>
            )}

            {/* Success Message display ONLY after actually saving */}
            {saveSuccessMessage && (
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold flex items-center gap-1 animate-fadeIn">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{saveSuccessMessage}</span>
              </span>
            )}
          </div>

          {/* Right: Primary Save Action & Close */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <button
              onClick={handleSaveChanges}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
