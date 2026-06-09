import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/integration/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  activeTab: string = 'Dashboard';
  
  // Indicators
  todayCount = 12;
  upcomingCount = 24;
  clientCount = 65;
  serviceCount = 8;

  // Upcoming appointments
  appointments = [
    { time: '09:00', client: 'Carlos Silva', service: 'Corte de Cabelo', status: 'Confirmado' },
    { time: '10:30', client: 'Ana Oliveira', service: 'Coloração', status: 'Confirmado' },
    { time: '14:00', client: 'João Santos', service: 'Manicure', status: 'Pendente' },
    { time: '16:15', client: 'Maria Pereira', service: 'Barba', status: 'Confirmado' }
  ];

  currentPage: number = 1;
  pageSize: number = 5;
  searchTerm: string = '';

  // Registered Clients
  clients = [
    { name: 'Carlos Silva', email: 'carlos@test.com', phone: '(11) 98765-4321', joined: '10/05/2026' },
    { name: 'Ana Oliveira', email: 'ana@test.com', phone: '(11) 91234-5678', joined: '14/05/2026' },
    { name: 'João Santos', email: 'joao@test.com', phone: '(11) 95555-4444', joined: '19/05/2026' },
    { name: 'Maria Pereira', email: 'maria@test.com', phone: '(11) 96666-7777', joined: '22/05/2026' },
    { name: 'Pedro Souza', email: 'pedro@test.com', phone: '(11) 94444-3333', joined: '25/05/2026' },
    { name: 'Lucas Costa', email: 'lucas@test.com', phone: '(11) 92222-1111', joined: '28/05/2026' },
    { name: 'Mariana Lima', email: 'mariana@test.com', phone: '(11) 93333-2222', joined: '01/06/2026' },
    { name: 'Juliana Rocha', email: 'juliana@test.com', phone: '(11) 97777-8888', joined: '02/06/2026' },
    { name: 'Felipe Alves', email: 'felipe@test.com', phone: '(11) 96666-5555', joined: '03/06/2026' },
    { name: 'Patricia Dias', email: 'patricia@test.com', phone: '(11) 98888-9999', joined: '04/06/2026' },
    { name: 'Gabriel Martins', email: 'gabriel@test.com', phone: '(11) 91111-2222', joined: '05/06/2026' },
    { name: 'Amanda Gomes', email: 'amanda@test.com', phone: '(11) 93333-4444', joined: '06/06/2026' },
    { name: 'Bruno Barbosa', email: 'bruno@test.com', phone: '(11) 95555-6666', joined: '07/06/2026' }
  ];

  get filteredClients() {
    if (!this.searchTerm.trim()) {
      return this.clients;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.clients.filter(client => 
      client.name.toLowerCase().includes(term) || 
      client.joined.toLowerCase().includes(term)
    );
  }

  get totalPages(): number {
    const total = Math.ceil(this.filteredClients.length / this.pageSize);
    return total > 0 ? total : 1;
  }

  get paginatedClients() {
    const filtered = this.filteredClients;
    const maxPage = this.totalPages;
    if (this.currentPage > maxPage) {
      this.currentPage = maxPage;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(startIndex, startIndex + this.pageSize);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Active Services
  services = [
    { name: 'Corte de Cabelo', duration: '30 min', price: 'R$ 50,00', category: 'Cabelo' },
    { name: 'Coloração', duration: '90 min', price: 'R$ 150,00', category: 'Cabelo' },
    { name: 'Manicure', duration: '45 min', price: 'R$ 40,00', category: 'Unhas' },
    { name: 'Barba', duration: '30 min', price: 'R$ 35,00', category: 'Barba' }
  ];

  selectTab(tabName: string) {
    this.activeTab = tabName;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
