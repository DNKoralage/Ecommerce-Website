import { redirect } from 'next/navigation';

export default function CategorySlugPage({ params }: { params: { slug: string } }) {
  redirect(`/products?category=${params.slug}`);
}
