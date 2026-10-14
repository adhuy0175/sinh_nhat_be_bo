/**
 * =========================================================================
 * TẬP TIN CẤU HÌNH TRANG WEB SINH NHẬT CÔNG CHÚA (21.10.2026)
 * =========================================================================
 * Tập trung trọn vẹn vào việc chúc mừng sinh nhật tuổi mới của bạn gái.
 * Tất cả nội dung bằng tiếng Việt tự nhiên, ấm áp và ngọt ngào.
 */

export interface MemoryPhoto {
  id: string;
  url: string;
  fallbackGradient?: string;
  title: string;
  caption: string;
  aspectRatio: 'portrait' | 'landscape' | 'square';
  sticker?: string;
}

export interface BirthdayWish {
  id: number;
  badge: string;
  title: string;
  wish: string;
  iconName: string;
}

export interface BirthdayGiftItem {
  icon: string;
  title: string;
  detail: string;
}

export interface BirthdayConfig {
  couple: {
    girlfriendName: string;
    boyfriendName: string;
    birthdayDate: string; // YYYY-MM-DD
    timezone: string;
    specialYear: string;
  };
  scene1: {
    badge: string;
    title: string;
    subtitle: string;
    buttonText: string;
  };
  scene2: {
    badge: string;
    title: string;
    subheading: string;
    candleButton: string;
    candleBlownMessage: string;
    blowInstructions: string;
  };
  scene3: {
    badge: string;
    title: string;
    subtitle: string;
    coverPhoto: {
      url: string;
      title: string;
      caption: string;
    };
    photos: MemoryPhoto[];
  };
  scene4: {
    badge: string;
    heading: string;
    subtitle: string;
    wishes: BirthdayWish[];
  };
  scene5: {
    badge: string;
    title: string;
    envelopeLabel: string;
    letterTitle: string;
    salutation: string;
    paragraphs: string[];
    closing: string;
    signature: string;
  };
  scene6: {
    badge: string;
    title: string;
    subtitle: string;
    tapPrompt: string;
    voucherTitle: string;
    voucherSubtitle: string;
    giftItems: BirthdayGiftItem[];
    secretNote: string;
  };
  scene7: {
    question: string;
    finalWish: string;
    birthdayGreeting: string;
    dateGreeting: string;
    fireworksButton: string;
    hugButtonText: string;
    hugMessageTitle: string;
    hugMessageBody: string;
  };
  music: {
    title: string;
    artist: string;
    src: string;
    useSynthesizerFallback: boolean;
  };
}

export const BIRTHDAY_CONFIG: BirthdayConfig = {
  couple: {
    girlfriendName: 'Công Chúa Của Anh',
    boyfriendName: 'Anh',
    birthdayDate: '2026-10-21',
    timezone: 'Asia/Ho_Chi_Minh',
    specialYear: '2026',
  },

  scene1: {
    badge: 'Ngày đặc biệt nhất năm ✨',
    title: 'Chúc mừng sinh nhật công chúa của anh! 🎂',
    subtitle:
      'Hôm nay là 21.10.2026 — ngày thiên thần đáng yêu nhất thế gian chào đời. Anh có một món quà bất ngờ chuẩn bị riêng cho em...',
    buttonText: 'Mở món quà sinh nhật đặc biệt 💌',
  },

  scene2: {
    badge: 'Khoảnh khắc ước nguyện 🕯️',
    title: 'Thổi nến sinh nhật cùng anh nhé! 🎂',
    subheading: '21.10.2026 — Nhắm mắt lại, ước một điều thật đẹp rồi cùng anh thổi tắt những ngọn nến lung linh.',
    candleButton: 'Thổi nến ước nguyện 🎂',
    candleBlownMessage:
      'Anh mong mọi điều ước của em hôm nay đều thành hiện thực! Tuổi mới luôn rạng rỡ, bình an và hạnh phúc nhé em yêu.',
    blowInstructions: 'Chạm vào nút bên dưới để thổi nến và gửi điều ước lên các vì sao ✨',
  },

  scene3: {
    badge: 'Album nụ cười 📸',
    title: 'Những khoảnh khắc đáng yêu của em 📸',
    subtitle: 'Nụ cười của em luôn là điều dịu dàng và rực rỡ nhất trong mắt anh.',
    coverPhoto: {
      url: '/photos/cover.jpg',
      title: 'Nụ cười rực rỡ nhất của công chúa',
      caption: 'Khoảnh khắc xinh đẹp khiến tim anh rung động mỗi khi ngắm nhìn.',
    },
    photos: [
      {
        id: 'mem-1',
        url: '/photos/memory-01.jpg',
        fallbackGradient: 'from-rose-100 via-pink-50 to-amber-50',
        title: 'Nụ cười tỏa nắng',
        caption: 'Chỉ cần thấy em cười, ngày u ám mấy cũng hóa đẹp trời.',
        aspectRatio: 'landscape',
        sticker: '✨',
      },
      {
        id: 'mem-2',
        url: '/photos/memory-02.jpg',
        fallbackGradient: 'from-pink-100 via-rose-50 to-orange-50',
        title: 'Góc nghiêng dịu dàng',
        caption: 'Công chúa nhỏ lúc nào cũng xinh xắn và đáng yêu.',
        aspectRatio: 'portrait',
        sticker: '🌸',
      },
      {
        id: 'mem-3',
        url: '/photos/memory-03.jpg',
        fallbackGradient: 'from-amber-100 via-rose-50 to-pink-50',
        title: 'Buổi sáng ngọt ngào',
        caption: 'Chúc em tuổi mới ngày nào cũng tràn ngập niềm vui dịu dàng.',
        aspectRatio: 'square',
        sticker: '☕',
      },
      {
        id: 'mem-4',
        url: '/photos/memory-04.jpg',
        fallbackGradient: 'from-red-100 via-pink-100 to-rose-50',
        title: 'Ánh hoàng hôn lấp lánh',
        caption: 'Mong nụ cười này sẽ luôn hiện diện trên môi em suốt tuổi mới.',
        aspectRatio: 'landscape',
        sticker: '🌅',
      },
      {
        id: 'mem-5',
        url: '/photos/memory-05.jpg',
        fallbackGradient: 'from-purple-100 via-pink-50 to-rose-50',
        title: 'Khoảnh khắc hồn nhiên',
        caption: 'Cứ mãi vô tư, vui tươi và yêu đời như thế này nhé!',
        aspectRatio: 'portrait',
        sticker: '🍃',
      },
      {
        id: 'mem-6',
        url: '/photos/memory-06.jpg',
        fallbackGradient: 'from-pink-200 via-rose-100 to-amber-50',
        title: 'Ánh mắt long lanh',
        caption: 'Đôi mắt biết cười chứa cả bầu trời dễ thương của em.',
        aspectRatio: 'landscape',
        sticker: '💫',
      },
      {
        id: 'mem-7',
        url: '/photos/memory-07.jpg',
        fallbackGradient: 'from-rose-100 via-peach-100 to-yellow-50',
        title: 'Dịu dàng như nắng sớm',
        caption: 'Chúc em tuổi mới luôn nhận được sự nâng niu và yêu thương nhất.',
        aspectRatio: 'portrait',
        sticker: '☀️',
      },
      {
        id: 'mem-8',
        url: '/photos/memory-08.jpg',
        fallbackGradient: 'from-orange-100 via-pink-100 to-rose-100',
        title: 'Bé con mê ăn ngon',
        caption: 'Tuổi mới ăn ngon ngủ ngoan, không âu lo phiền muộn.',
        aspectRatio: 'square',
        sticker: '🍰',
      },
      {
        id: 'mem-9',
        url: '/photos/memory-09.jpg',
        fallbackGradient: 'from-rose-100 via-pink-100 to-indigo-50',
        title: 'Lung linh trong đêm',
        caption: 'Ngôi sao sáng nhất đêm nay chính là em.',
        aspectRatio: 'landscape',
        sticker: '⭐',
      },
      {
        id: 'mem-10',
        url: '/photos/memory-10.jpg',
        fallbackGradient: 'from-pink-100 via-rose-50 to-red-50',
        title: 'Góc nhỏ bình yên',
        caption: 'Mong cuộc đời luôn đối xử với em bằng sự dịu dàng lớn nhất.',
        aspectRatio: 'portrait',
        sticker: '🤍',
      },
      {
        id: 'mem-11',
        url: '/photos/memory-11.jpg',
        fallbackGradient: 'from-amber-50 via-rose-100 to-pink-100',
        title: 'Những bước chân vui vẻ',
        caption: 'Tuổi mới sẽ mở ra thêm thật nhiều hành trình mới tuyệt vời.',
        aspectRatio: 'landscape',
        sticker: '🎈',
      },
      {
        id: 'mem-12',
        url: '/photos/memory-12.jpg',
        fallbackGradient: 'from-rose-200 via-pink-100 to-amber-100',
        title: 'Mãi là công chúa của anh',
        caption: 'Dù ở độ tuổi nào, em vẫn là người đáng yêu nhất quả đất.',
        aspectRatio: 'portrait',
        sticker: '👑',
      },
    ],
  },

  scene4: {
    badge: 'Tâm nguyện từ trái tim 💖',
    heading: 'Những lời chúc ngọt ngào nhất cho tuổi mới của em 🌟',
    subtitle: 'Chạm vào từng tấm thiệp xinh xắn để nhận một lời chúc ấm áp từ anh',
    wishes: [
      {
        id: 1,
        badge: 'Niềm Vui',
        title: 'Nụ cười rạng rỡ mỗi ngày',
        wish: 'Chúc em tuổi mới ngày nào cũng có lý do để mỉm cười thật tươi, luôn tràn ngập năng lượng tích cực và hạnh phúc mỗi sớm mai thức dậy.',
        iconName: 'Smile',
      },
      {
        id: 2,
        badge: 'Bình An',
        title: 'Sức khỏe & An yên',
        wish: 'Mong em luôn có một sức khỏe thật tốt, những giấc ngủ thật êm đềm, và một tâm hồn nhẹ nhàng thanh thản giữa cuộc sống bận rộn.',
        iconName: 'ShieldCheck',
      },
      {
        id: 3,
        badge: 'Ước Mơ',
        title: 'Vạn điều thuận buồm xuôi gió',
        wish: 'Chúc cho mọi hoài bão, dự định và ước mơ trong tuổi mới của em đều nở hoa rực rỡ. Hãy vững tin vì anh luôn là hậu phương của em.',
        iconName: 'Sparkles',
      },
      {
        id: 4,
        badge: 'Tỏa Sáng',
        title: 'Luôn tự tin là chính mình',
        wish: 'Em xinh đẹp và cuốn hút nhất khi được là chính em. Chúc công chúa luôn kiêu hãnh, độc lập và tỏa sáng theo cách riêng biệt của mình.',
        iconName: 'Sun',
      },
      {
        id: 5,
        badge: 'May Mắn',
        title: 'Ngập tràn điều dễ thương',
        wish: 'Mong vũ trụ mang đến cho em muôn vàn may mắn, luôn gặp gỡ những điều ngọt ngào, những con người tử tế và nhiều niềm vui bất ngờ.',
        iconName: 'Gift',
      },
      {
        id: 6,
        badge: 'Tình Yêu',
        title: 'Luôn được yêu thương hết lòng',
        wish: 'Và điều tuyệt nhất: Dù em bước sang tuổi nào, em vẫn mãi là công chúa nhỏ được anh trân trọng, nâng niu và yêu thương vô điều kiện. ❤️',
        iconName: 'Heart',
      },
    ],
  },

  scene5: {
    badge: 'Lá thư từ trái tim 💌',
    title: 'Bức thư sinh nhật gửi riêng công chúa 💌',
    envelopeLabel: 'Thư chúc mừng sinh nhật 21.10.2026',
    letterTitle: 'Gửi người con gái anh yêu thương nhất,',
    salutation: 'Gửi em yêu,',
    paragraphs: [
      'Hôm nay là ngày 21.10.2026 — ngày sinh nhật đặc biệt nhất trong năm của em.',
      'Chúc mừng em bước sang một tuổi mới thật đẹp! Nhìn thấy em đón tuổi mới với nụ cười rạng rỡ trên môi, lòng anh ngập tràn niềm vui và sự biết ơn vì đã có em trong cuộc đời này.',
      'Ở tuổi mới, anh mong em luôn khỏe mạnh, bình an và luôn giữ được nét hồn nhiên, đáng yêu vốn có. Mong em đạt được những ước mơ em hằng ấp ủ, có những chuyến đi thú vị, thưởng thức những món ăn ngon và tận hưởng từng khoảnh khắc tươi đẹp của cuộc sống.',
      'Dù cuộc sống ngoài kia đôi khi có những ngày áp lực hay không như ý, em hãy luôn nhớ rằng phía sau em luôn có một bờ vai ấm áp, một người luôn lắng nghe, chia sẻ và sẵn sàng ôm em thật chặt bất cứ lúc nào.',
      'Chúc em một ngày sinh nhật ngập tràn tiếng cười, đầy hoa và những điều kỳ diệu. Em xứng đáng nhận được tất cả những điều dịu dàng và hạnh phúc nhất trên thế giới này.',
    ],
    closing: 'Chúc mừng sinh nhật công chúa nhỏ của anh! 🎂✨',
    signature: 'Người luôn yêu thương và chúc phúc cho em ❤️',
  },

  scene6: {
    badge: 'Món quà bất ngờ 🎁',
    title: 'Hộp quà sinh nhật bí mật 🎁',
    subtitle: 'Anh đã chuẩn bị một món quà đặc biệt dành riêng cho em, em chạm vào hộp để mở nhé!',
    tapPrompt: 'Chạm nhẹ vào chiếc nơ để mở quà ✨',
    voucherTitle: 'TẤM VÉ ĐẶC QUYỀN SINH NHẬT CÔNG CHÚA 👑',
    voucherSubtitle: 'Có hiệu lực vô thời hạn · Áp dụng cho mọi yêu cầu của em yêu',
    giftItems: [
      {
        icon: '🍽️',
        title: 'Bữa tối sinh nhật lãng mạn',
        detail: 'Một bữa tối ấm cúng dưới ánh nến tại bất kỳ nhà hàng nào em yêu thích.',
      },
      {
        icon: '🎁',
        title: 'Món quà thật bên ngoài',
        detail: 'Món quà sinh nhật anh đã bí mật chuẩn bị sẵn để tận tay trao cho em.',
      },
      {
        icon: '✈️',
        title: 'Chuyến vi vu xả stress',
        detail: 'Một chuyến đi dạo mát, cà phê hay du lịch đổi gió bất cứ khi nào em muốn.',
      },
      {
        icon: '💖',
        title: 'Đặc quyền làm nũng 24/7',
        detail: 'Vô hạn cái ôm, lời dỗ dành và luôn được anh chiều chuộng tuyệt đối.',
      },
    ],
    secretNote: 'Chúc em một sinh nhật thật hạnh phúc! Anh yêu em rất nhiều.',
  },

  scene7: {
    question: 'Em có biết hôm nay là ngày gì không? ✨',
    finalWish: 'Chúc em tuổi mới thật rực rỡ, hạnh phúc và luôn được yêu thương. Anh yêu em! ❤️',
    birthdayGreeting: 'Happy Birthday, Công Chúa Của Anh! 🎂',
    dateGreeting: '21.10.2026 — Rực rỡ như nụ cười của em ✨',
    fireworksButton: 'Bắn pháo hoa chúc mừng 🎆',
    hugButtonText: 'Nhận cái ôm sinh nhật ấm áp 🤗',
    hugMessageTitle: 'Gửi tặng em một cái ôm sinh nhật thật chặt! 💖',
    hugMessageBody:
      'Chúc mừng sinh nhật em yêu! Cảm ơn em vì đã đến và làm cuộc sống của anh trở nên ngập tràn sắc màu hạnh phúc. Tuổi mới thật an yên và rạng ngời nhé!',
  },

  music: {
    title: 'Thế Giới Của Anh',
    artist: 'Dành tặng sinh nhật em',
    src: '/music/the-gioi-cua-anh.mp3',
    useSynthesizerFallback: true,
  },
};
