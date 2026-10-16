import type { CSSProperties } from "react";

type AgendaImageProps = { image: string; name: string; cover?: boolean; elastic?: string };

export function AgendaImage({ image, name, cover = false, elastic }: AgendaImageProps) {
  if (!cover) return <img src={image} alt={name} width={1024} height={1024} loading="lazy" />;
  const style = elastic ? ({ "--elastic": elastic } as CSSProperties) : undefined;
  return <span className="agenda-stage"><span className="agenda-book" style={style}><img src={image} alt={`${name}, tapa con elástico de cierre`} loading="lazy" /><span className="agenda-binding" aria-hidden="true" /><span className="agenda-elastic" aria-hidden="true" /></span></span>;
}
