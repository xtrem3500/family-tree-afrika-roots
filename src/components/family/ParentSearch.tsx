import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { Label } from '@/components/ui/label';

interface ParentSearchProps {
  onSelect: (parent: User) => void;
  selectedParent: User | null;
  className?: string;
}

export const ParentSearch: React.FC<ParentSearchProps> = ({
  onSelect,
  selectedParent,
  className = '',
}) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: parents, isLoading } = useQuery({
    queryKey: ['parents', search],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('first_name', `%${search}%`)
        .or(`last_name.ilike.%${search}%`)
        .limit(5);

      if (error) throw error;
      return data as User[];
    },
    enabled: search.length > 2,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (parent: User) => {
    onSelect(parent);
    setSearch('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Input
          type="text"
          placeholder="Rechercher un parent..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setSearch('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && (search || isLoading) && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Recherche en cours...</div>
          ) : parents?.length === 0 ? (
            <div className="p-4 text-center text-gray-500">Aucun résultat trouvé</div>
          ) : (
            <div className="py-1">
              {parents?.map((parent) => (
                <button
                  key={parent.id}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3"
                  onClick={() => handleSelect(parent)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={parent.photo_url} />
                    <AvatarFallback>
                      {parent.first_name[0]}{parent.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {parent.first_name} {parent.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{parent.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedParent && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedParent.photo_url} />
              <AvatarFallback>
                {selectedParent.first_name[0]}{selectedParent.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">
                {selectedParent.first_name} {selectedParent.last_name}
              </div>
              <div className="text-sm text-gray-500">{selectedParent.email}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect(null)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
