// Степень достоверности хадиса.
//
// Принцип — ничего не выдумывать:
//  1) если у записи есть явное поле `grade` — используем его (заполняется после проверки);
//  2) хадис из «Сахиха» аль-Бухари или «Сахиха» Муслима — сахих (по единогласному
//     мнению учёных, всё с полным иснадом в этих двух сборниках достоверно);
//  3) если степень прямо написана в строке источника («…как хасан») — берём её;
//  4) иначе — «не указана»: такие хадисы ждут проверки знающим человеком.

export const GRADES = {
  sahih:  { id: 'sahih',  label: 'Сахих',  hint: 'достоверный' },
  hasanSahih: { id: 'hasanSahih', label: 'Хасан сахих', hint: 'хороший достоверный' },
  hasan:  { id: 'hasan',  label: 'Хасан',  hint: 'хороший' },
  daif:   { id: 'daif',   label: 'Даиф',   hint: 'слабый' },
};

const SAHIHAYN_RE = /(Бухари|Муслим)/i;

export function hadithGrade(item) {
  if (!item) return null;
  if (item.grade && GRADES[item.grade]) {
    return { ...GRADES[item.grade], basis: item.gradeBasis || 'по оценке хадисоведов' };
  }
  const src = item.source || '';
  if (SAHIHAYN_RE.test(src)) {
    return { ...GRADES.sahih, basis: 'хадис из Сахихов аль-Бухари / Муслима' };
  }
  if (/хасан/i.test(src)) return { ...GRADES.hasan, basis: 'указано в источнике' };
  if (/даиф|слаб/i.test(src)) return { ...GRADES.daif, basis: 'указано в источнике' };
  return null; // не указана
}
