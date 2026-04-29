import { redirect } from 'next/navigation';

// Постоянная ссылка-редиректор для статей Яндекс.Дзен.
// Если форма переедет — меняем только redirect здесь, статьи не трогаем.
export default function ConsultRedirect() {
  redirect('/');
}
