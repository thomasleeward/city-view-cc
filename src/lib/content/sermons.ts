export type SermonSeries = {
  id: string;
  name: string;
  dateLabel: string;
  startDate: string;
  endDate: string | null;
  imageUrl: string | null;
  youtubePlaylistUrl: string;
  isPublished?: boolean;
};

export const fallbackSermonSeries: SermonSeries[] = [
  {
    id: "bent-out-of-shape",
    name: "Bent Out Of Shape",
    dateLabel: "5/3/2026-Present",
    startDate: "2026-05-03",
    endDate: null,
    imageUrl:
      "https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TgdpRjDTCwsCEKFTusIi/media/69f82124efa24d4ae0d7823f.png",
    youtubePlaylistUrl:
      "https://www.youtube.com/playlist?list=PLTe-INsuucft1feUrzbyWuOYMe-d8xi9n",
    isPublished: true,
  },
  {
    id: "gradually-then-suddenly",
    name: "Gradually Then Suddenly",
    dateLabel: "4/5/2026-4/19/2026",
    startDate: "2026-04-05",
    endDate: "2026-04-19",
    imageUrl:
      "https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TgdpRjDTCwsCEKFTusIi/media/69d95186019dc508d313bcdc.png",
    youtubePlaylistUrl:
      "https://www.youtube.com/playlist?list=PLTe-INsuucftTE4aDabXTAWN_UhvdIQMN",
    isPublished: true,
  },
  {
    id: "red-flags",
    name: "Red Flags",
    dateLabel: "3/1/2026-3/22/2026",
    startDate: "2026-03-01",
    endDate: "2026-03-22",
    imageUrl:
      "https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TgdpRjDTCwsCEKFTusIi/media/69a60230b701fe00212a5152.jpg",
    youtubePlaylistUrl:
      "https://www.youtube.com/playlist?list=PLTe-INsuucfudX_mvb1DWA58oknRkBV6G",
    isPublished: true,
  },
  {
    id: "altars-and-ashes",
    name: "Altars And Ashes",
    dateLabel: "2/1/2026-2/22/2026",
    startDate: "2026-02-01",
    endDate: "2026-02-22",
    imageUrl:
      "https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TgdpRjDTCwsCEKFTusIi/media/6983a1f70a7fd1a63a4d53ca.jpg",
    youtubePlaylistUrl:
      "https://www.youtube.com/playlist?list=PLTe-INsuucfvEU9XBd5vtAezp5cQ4V_YN",
    isPublished: true,
  },
  {
    id: "first-things-first",
    name: "First Things First",
    dateLabel: "1/4/2026-1/25/2026",
    startDate: "2026-01-04",
    endDate: "2026-01-25",
    imageUrl:
      "https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TgdpRjDTCwsCEKFTusIi/media/695bd3b4177684f6e82eb208.jpg",
    youtubePlaylistUrl:
      "https://www.youtube.com/playlist?list=PLTe-INsuucfuw401sSSJ3b5uM9qLbFw9y",
    isPublished: true,
  },
  {
    id: "when-necessary",
    name: "When Necessary",
    dateLabel: "9/28/2025-10/26/2025",
    startDate: "2025-09-28",
    endDate: "2025-10-26",
    imageUrl:
      "https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/TgdpRjDTCwsCEKFTusIi/media/68dda4f626a5e2ba5a134c2a.jpeg",
    youtubePlaylistUrl:
      "https://www.youtube.com/playlist?list=PLTe-INsuucfu7VF0bw3NMuyAOHqMSqHuv",
    isPublished: true,
  },
];
