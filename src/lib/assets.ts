import k540 from "@/assets/khriys-540.webp.asset.json";
import k1080 from "@/assets/khriys-1080.webp.asset.json";
import i540 from "@/assets/inf8m8us-540.webp.asset.json";
import i1080 from "@/assets/inf8m8us-1080.webp.asset.json";
import money from "@/assets/dinheiro-768.webp.asset.json";
import goyard from "@/assets/goyard-768.webp.asset.json";

export const img = {
  khriys: { src: k540.url, srcSet: `${k540.url} 540w, ${k1080.url} 1080w` },
  inf8m8us: { src: i540.url, srcSet: `${i540.url} 540w, ${i1080.url} 1080w` },
  money: money.url,
  goyard: goyard.url,
};
