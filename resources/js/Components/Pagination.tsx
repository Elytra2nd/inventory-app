import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

export default function Pagination({ links }: PaginationProps) {
  // SAFETY CHECK:
  // Jika links kosong ATAU bukan array, jangan render apa-apa (return null)
  if (!links || !Array.isArray(links) || links.length === 0) return null;

  // Jika hanya 1 halaman (biasanya 3 link: prev, 1, next), sembunyikan
  if (links.length === 3) return null;

  return (
    <div className="flex flex-wrap justify-center gap-1 mt-6">
      {links.map((link, key) => {
        // Ganti label HTML entitas (&laquo;) jadi icon
        let label = link.label;
        if (link.label.includes('Previous')) label = 'prev';
        if (link.label.includes('Next')) label = 'next';

        return link.url ? (
          <Button
            key={key}
            variant={link.active ? 'default' : 'outline'}
            size="sm"
            asChild
            className={link.active ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <Link href={link.url} preserveScroll>
              {label === 'prev' ? (
                <ChevronLeft className="h-4 w-4" />
              ) : label === 'next' ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <span dangerouslySetInnerHTML={{ __html: label }} />
              )}
            </Link>
          </Button>
        ) : (
          <Button key={key} variant="ghost" size="sm" disabled className="opacity-50">
            {label === 'prev' ? (
              <ChevronLeft className="h-4 w-4" />
            ) : label === 'next' ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <span dangerouslySetInnerHTML={{ __html: label }} />
            )}
          </Button>
        );
      })}
    </div>
  );
}
