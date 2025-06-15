import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface MemberSearchProps {
  onSelect: (member: User) => void;
  excludeIds?: string[];
  className?: string;
}

export const MemberSearch: React.FC<MemberSearchProps> = ({
  onSelect,
  excludeIds = [],
  className
}) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const { data: members, isLoading } = useQuery({
    queryKey: ['members-search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`first_name.ilike.%${debouncedSearch}%,last_name.ilike.%${debouncedSearch}%`)
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .limit(5);

      if (error) throw error;
      return data as User[];
    },
    enabled: debouncedSearch.length > 0
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.member-search')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative member-search', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Rechercher un membre..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          className="pl-10 pr-10"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setSearch('');
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (search || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          <ScrollArea className="max-h-60">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Recherche en cours...</div>
            ) : members?.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucun résultat trouvé</div>
            ) : (
              <div className="py-1">
                {members?.map((member) => (
                  <button
                    key={member.id}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3"
                    onClick={() => {
                      onSelect(member);
                      setSearch('');
                      setIsOpen(false);
                    }}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.photo_url} />
                      <AvatarFallback>
                        {member.first_name[0]}{member.last_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {member.first_name} {member.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
