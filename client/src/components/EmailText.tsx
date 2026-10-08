/**
 * Alamat email sebagai teks dengan titik patah yang DISENGAJA setelah @.
 *
 * Email adalah satu token tanpa spasi. Tanpa titik patah, pilihan browser
 * tinggal dua: patah di tengah kata (overflow-wrap: anywhere) atau menembus
 * kontainer. Dengan <wbr> setelah @, patah terjadi antara bagian lokal dan
 * domain — "akbarnawasunda@" / "gmail.com" — bukan di tengah kata.
 * (docs/desktop-visual-qa-cursor-pass.md §3)
 */
export function EmailText({ value }: { value: string }) {
  const at = value.lastIndexOf("@");
  if (at <= 0 || at === value.length - 1) return <>{value}</>;
  return (
    <>
      {value.slice(0, at + 1)}
      <wbr />
      {value.slice(at + 1)}
    </>
  );
}
