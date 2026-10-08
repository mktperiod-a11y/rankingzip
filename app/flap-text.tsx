"use client";

export function FlapText({ text }: { text: string }) {
  return <span className="flap"><span className="flap-word" key={text}>{text}</span></span>;
}
