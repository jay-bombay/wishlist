import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, Variant } from '../../ProductCard';
import { ProductListService } from '../../product-list.service';
import { Subscription, Observable, of } from 'rxjs';

@Component({
  selector: 'app-wishlist-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wishlist-products.component.html',
  styleUrls: ['./wishlist-products.component.css']
})
export class WishlistProductsComponent implements OnInit, OnDestroy {
  wishlistProducts$: Observable<Product[]>; // Expose the observable
  private wishlistSubscription: Subscription = new Subscription();
  private localItem: string | null = null;
  private wishlistItems: Product[] = [];
  isOpen = false;

  constructor(private productListService: ProductListService, private cdr: ChangeDetectorRef) {
    this.loadWishlistItemsFromLocalStorage();
    this.wishlistProducts$ = this.productListService.getWishlistUpdates(); // Assign the observable
  }

  ngOnInit(): void {
    this.wishlistSubscription = this.wishlistProducts$.subscribe((wishlist: Product[]) => {
      this.wishlistItems = wishlist;
      this.updateWishlistProducts();
    });
    this.updateWishlistProducts();
  }

  ngOnDestroy(): void {
    this.wishlistSubscription.unsubscribe();
  }

  toggleWishlistStatus(): void {
    this.isOpen = !this.isOpen;
  }

  toggleWishlist(event: Event, product: Product, variantSku: string): void {
    event.preventDefault();
    const button = event.currentTarget as HTMLElement;
    const variant = product.variants.find(v => v.sku === variantSku);

    if (variant) {
      // Toggle the wishlist status of the found variant
      variant.wishlist = !variant.wishlist;

      const variantIndex = this.findVariantIndex(product, variantSku);

      if (variantIndex > -1) {
        this.removeProductFromWishlist(variantIndex, button);
        variant.wishlist = false; 
      } else {
        this.addProductToWishlist(product, button);
        variant.wishlist = true;
      }

      this.updateWishlistLocalStorage();
      this.productListService.updateWishlist(this.wishlistItems);
    }
  }

  private loadWishlistItemsFromLocalStorage(): void {
    this.localItem = localStorage.getItem('wishlistItems');
    this.wishlistItems = this.localItem ? JSON.parse(this.localItem) : [];
  }
  private updateWishlistProducts(): void {
    this.wishlistProducts$ = of(this.wishlistItems.map((item: Product) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      vendor: item.vendor,
      variants: item.variants,
      variant: item.variants[0],
      variantWishlist: item.variants[0].wishlist,
      wishlist: item.variants[0].wishlist
    })));
    this.cdr.detectChanges();
    console.log(this.wishlistProducts$, 'wishlistProducts');
  }

  private findVariantIndex(product: Product, variantSku: string): number {
    return this.wishlistItems.findIndex(
      (item) => item.id === product.id && item.variants.some((variant) => variant.sku === variantSku)
    );
  }

  private removeProductFromWishlist(index: number, button: HTMLElement): void {
    this.wishlistItems.splice(index, 1);
    button.classList.remove('wishlist-added');

    if (button.classList.contains('wishlist-product-delete')) {
      const id = button.getAttribute('data-id');
      this.removeWishlistClassFromProductCard(id);
    }
  }

  private addProductToWishlist(product: Product, button: HTMLElement): void {
    this.wishlistItems.push(product);
    button.classList.add('wishlist-added');
  }

  private removeWishlistClassFromProductCard(productId: string | null): void {
    if (productId) {
      const productCard = document.querySelector(`.card[data-id="${productId}"]`);
      const wishlistButton = productCard?.querySelector('.add-to-wishlist-form');
      wishlistButton?.classList.remove('wishlist-added');
    }
  }

  private updateWishlistLocalStorage(): void {
    localStorage.setItem('wishlistItems', JSON.stringify(this.wishlistItems));
  }
}
