import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { Product } from './ProductCard';

@Injectable({
  providedIn: 'root'
})
export class ProductListService {
  url = 'https://hiring-workspace.vercel.app/api/v1/furniture';
  products: Product[] | undefined;
  private wishlistSubject = new Subject<Product[]>();

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url);
  }

  getWishlistUpdates(): Observable<Product[]> {
    return this.wishlistSubject.asObservable();
  }

  updateWishlist(wishlist: Product[]): void {
    this.wishlistSubject.next(wishlist);
  }
}
