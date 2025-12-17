import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/Components/ui/toaster';
import { PageProps } from '@/types';

// Definisikan tipe agar TypeScript senang
interface ExtendedPageProps extends PageProps {
  flash: {
    success?: string;
    error?: string;
  };
}

export default function FlashToaster() {
  const { toast } = useToast();
  // Casting ke tipe custom kita
  const { flash } = usePage<ExtendedPageProps>().props;

  useEffect(() => {
    // Gunakan optional chaining (?.) agar tidak error jika flash undefined
    if (flash?.success) {
      toast({
        title: 'Berhasil!',
        description: flash.success,
        variant: 'default',
        className: 'bg-green-50 border-green-200 text-green-800',
      });
    }

    if (flash?.error) {
      toast({
        title: 'Error',
        description: flash.error,
        variant: 'destructive',
      });
    }
  }, [flash, toast]);

  return <Toaster />;
}
