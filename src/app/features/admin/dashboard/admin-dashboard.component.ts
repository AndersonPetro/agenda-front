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
    { date: '11/06/2026', time: '09:00', client: 'Carlos Silva', service: 'Corte de Cabelo', status: 'Confirmado' },
    { date: '11/06/2026', time: '10:30', client: 'Ana Oliveira', service: 'Coloração', status: 'Confirmado' },
    { date: '12/06/2026', time: '14:00', client: 'João Santos', service: 'Manicure', status: 'Pendente' },
    { date: '12/06/2026', time: '16:15', client: 'Maria Pereira', service: 'Barba', status: 'Confirmado' },
    { date: '13/06/2026', time: '09:30', client: 'Pedro Souza', service: 'Corte de Cabelo', status: 'Confirmado' },
    { date: '13/06/2026', time: '11:00', client: 'Lucas Costa', service: 'Barba', status: 'Pendente' },
    { date: '14/06/2026', time: '15:00', client: 'Mariana Lima', service: 'Manicure', status: 'Confirmado' }
  ];

  // Pagination for Dashboard (Próximos Agendamentos)
  dashboardApptsPage: number = 1;
  dashboardApptsPageSize: number = 3;

  // Pagination for Control (Controle de Agenda)
  controlApptsPage: number = 1;
  controlApptsPageSize: number = 4;

  // Pagination for Services (Catálogo de Serviços)
  servicesPage: number = 1;
  servicesPageSize: number = 3;

  currentPage: number = 1;
  pageSize: number = 5;
  searchTerm: string = '';

  // Registered Clients
  clients = [
    { name: 'Carlos Silva', email: 'carlos@test.com', phone: '(11) 98765-4321', joined: '10/05/2026', status: 'Ativo' },
    { name: 'Ana Oliveira', email: 'ana@test.com', phone: '(11) 91234-5678', joined: '14/05/2026', status: 'Ativo' },
    { name: 'João Santos', email: 'joao@test.com', phone: '(11) 95555-4444', joined: '19/05/2026', status: 'Ativo' },
    { name: 'Maria Pereira', email: 'maria@test.com', phone: '(11) 96666-7777', joined: '22/05/2026', status: 'Ativo' },
    { name: 'Pedro Souza', email: 'pedro@test.com', phone: '(11) 94444-3333', joined: '25/05/2026', status: 'Ativo' },
    { name: 'Lucas Costa', email: 'lucas@test.com', phone: '(11) 92222-1111', joined: '28/05/2026', status: 'Ativo' },
    { name: 'Mariana Lima', email: 'mariana@test.com', phone: '(11) 93333-2222', joined: '01/06/2026', status: 'Ativo' },
    { name: 'Juliana Rocha', email: 'juliana@test.com', phone: '(11) 97777-8888', joined: '02/06/2026', status: 'Ativo' },
    { name: 'Felipe Alves', email: 'felipe@test.com', phone: '(11) 96666-5555', joined: '03/06/2026', status: 'Ativo' },
    { name: 'Patricia Dias', email: 'patricia@test.com', phone: '(11) 98888-9999', joined: '04/06/2026', status: 'Ativo' },
    { name: 'Gabriel Martins', email: 'gabriel@test.com', phone: '(11) 91111-2222', joined: '05/06/2026', status: 'Ativo' },
    { name: 'Amanda Gomes', email: 'amanda@test.com', phone: '(11) 93333-4444', joined: '06/06/2026', status: 'Ativo' },
    { name: 'Bruno Barbosa', email: 'bruno@test.com', phone: '(11) 95555-6666', joined: '07/06/2026', status: 'Ativo' }
  ];

  get totalDashboardApptsPages(): number {
    const total = Math.ceil(this.appointments.length / this.dashboardApptsPageSize);
    return total > 0 ? total : 1;
  }

  get paginatedDashboardAppts() {
    const maxPage = this.totalDashboardApptsPages;
    if (this.dashboardApptsPage > maxPage) {
      this.dashboardApptsPage = maxPage;
    }
    const startIndex = (this.dashboardApptsPage - 1) * this.dashboardApptsPageSize;
    return this.appointments.slice(startIndex, startIndex + this.dashboardApptsPageSize);
  }

  get totalControlApptsPages(): number {
    const total = Math.ceil(this.appointments.length / this.controlApptsPageSize);
    return total > 0 ? total : 1;
  }

  get paginatedControlAppts() {
    const maxPage = this.totalControlApptsPages;
    if (this.controlApptsPage > maxPage) {
      this.controlApptsPage = maxPage;
    }
    const startIndex = (this.controlApptsPage - 1) * this.controlApptsPageSize;
    return this.appointments.slice(startIndex, startIndex + this.controlApptsPageSize);
  }

  get totalServicesPages(): number {
    const total = Math.ceil(this.services.length / this.servicesPageSize);
    return total > 0 ? total : 1;
  }

  get paginatedServices() {
    const maxPage = this.totalServicesPages;
    if (this.servicesPage > maxPage) {
      this.servicesPage = maxPage;
    }
    const startIndex = (this.servicesPage - 1) * this.servicesPageSize;
    return this.services.slice(startIndex, startIndex + this.servicesPageSize);
  }

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

  confirmAppointment(appt: any) {
    appt.status = 'Confirmado';
  }

  cancelAppointment(appt: any) {
    appt.status = 'Cancelado';
  }

  // Active Services
  services = [
    { name: 'Corte de Cabelo', duration: '30 min', price: 'R$ 50,00', category: 'Cabelo', funcionario: 'Carlos' },
    { name: 'Coloração', duration: '90 min', price: 'R$ 150,00', category: 'Cabelo', funcionario: 'Ana' },
    { name: 'Manicure', duration: '45 min', price: 'R$ 40,00', category: 'Unhas', funcionario: 'João' },
    { name: 'Barba', duration: '30 min', price: 'R$ 35,00', category: 'Barba', funcionario: 'Maria' }
  ];

  showServiceModal: boolean = false;
  isEditMode: boolean = false;
  editingServiceRef: any = null;

  newService = {
    name: '',
    category: '',
    duration: '',
    price: '',
    funcionario: ''
  };

  openServiceModal() {
    this.isEditMode = false;
    this.editingServiceRef = null;
    this.showServiceModal = true;
    this.newService = {
      name: '',
      category: '',
      duration: '',
      price: '',
      funcionario: ''
    };
  }

  openEditServiceModal(service: any) {
    this.isEditMode = true;
    this.editingServiceRef = service;
    this.newService = { ...service };
    this.showServiceModal = true;
  }

  closeServiceModal() {
    this.showServiceModal = false;
  }

  addService() {
    if (this.newService.name && this.newService.category && this.newService.duration && this.newService.price && this.newService.funcionario) {
      if (this.isEditMode && this.editingServiceRef) {
        Object.assign(this.editingServiceRef, this.newService);
      } else {
        this.services.push({ ...this.newService });
        this.serviceCount = this.services.length;
      }
      this.closeServiceModal();
    }
  }

  deleteService(service: any) {
    this.services = this.services.filter(s => s !== service);
    this.serviceCount = this.services.length;
    if (this.servicesPage > this.totalServicesPages) {
      this.servicesPage = this.totalServicesPages;
    }
  }

  showClientModal: boolean = false;
  editingClientRef: any = null;
  newClientData = {
    name: '',
    email: '',
    phone: '',
    status: 'Ativo'
  };

  openEditClientModal(client: any) {
    this.editingClientRef = client;
    this.newClientData = { ...client, status: client.status || 'Ativo' };
    this.showClientModal = true;
  }

  closeClientModal() {
    this.showClientModal = false;
  }

  toggleClientStatus(event: any) {
    this.newClientData.status = event.target.checked ? 'Ativo' : 'Bloqueado';
  }

  updateClient() {
    if (this.editingClientRef) {
      Object.assign(this.editingClientRef, this.newClientData);
      this.closeClientModal();
    }
  }

  selectTab(tabName: string) {
    this.activeTab = tabName;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
