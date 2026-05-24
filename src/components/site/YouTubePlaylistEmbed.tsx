function getPlaylistId(url: string) {
  try {
    return new URL(url).searchParams.get("list");
  } catch {
    return null;
  }
}

export function YouTubePlaylistEmbed({ url, title }: { url: string; title: string }) {
  const playlistId = getPlaylistId(url);

  if (!playlistId) return null;

  return (
    <div className="aspect-video overflow-hidden rounded-lg bg-ink">
      <iframe
        className="size-full"
        src={`https://www.youtube.com/embed/videoseries?list=${playlistId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
