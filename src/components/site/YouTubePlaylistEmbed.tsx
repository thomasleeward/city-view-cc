import {youtubeEmbedUrl} from '@/lib/youtube';
export function YouTubePlaylistEmbed({ url, title }: { url: string; title: string }) {
  const embedUrl = youtubeEmbedUrl(url);

  if (!embedUrl) return null;

  return (
    <div className="aspect-video overflow-hidden rounded-lg bg-ink">
      <iframe
        className="size-full"
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
