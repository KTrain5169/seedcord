import type {
    PackageCatalogEntry,
    NavigationCategory,
    NavigationEntityItem,
    PackageVersionCatalog
} from '#lib/docs/types';
import type { EntityToneStyle } from '#lib/tonePresentation';
import type { LucideIcon } from 'lucide-react';

type SidebarVariant = 'desktop' | 'mobile';

export interface SidebarProps {
    catalog: readonly PackageCatalogEntry[];
    // the island's caller passes this from the page url, because no router serves it to an island
    pathname: string;
    activePackageId: string;
    activeVersionId: string;
    variant?: SidebarVariant;
    className?: string;
    onSelect?: () => void;
}

export interface SidebarCategoryListProps {
    categories: readonly NavigationCategory[];
    activeHref: string;
    storageKey?: string;
    onSelect?: () => void;
}

export interface SidebarItemProps extends Pick<NavigationEntityItem, 'label' | 'href'> {
    icon: LucideIcon;
    styles: Pick<EntityToneStyle, 'item' | 'badge'>;
    isActive: boolean;
    onSelect?: () => void;
}

export type SidebarHeaderPackageOption = PackageCatalogEntry;
export type SidebarHeaderVersionOption = PackageVersionCatalog;
