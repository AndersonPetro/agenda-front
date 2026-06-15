import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/integration/auth/auth.service';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { UserService } from '../../../core/integration/user/user.service';
import { AppointmentService } from '../../../core/integration/appointment/appointment.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private userService = inject(UserService);
  private appointmentService = inject(AppointmentService);

  activeTab: string = 'Dashboard';
  
  // Indicators
  todayCount = 12;
  upcomingCount = 24;
  clientCount = 0;
  serviceCount = 8;

  // Upcoming appointments
  staticAppointments = [
    { date: '11/06/2026', time: '09:00', client: 'Carlos Silva', service: 'Corte de Cabelo', status: 'Confirmado' },
    { date: '11/06/2026', time: '10:30', client: 'Ana Oliveira', service: 'Coloração', status: 'Confirmado' },
    { date: '12/06/2026', time: '14:00', client: 'João Santos', service: 'Manicure', status: 'Pendente' },
    { date: '12/06/2026', time: '16:15', client: 'Maria Pereira', service: 'Barba', status: 'Confirmado' },
    { date: '13/06/2026', time: '09:30', client: 'Pedro Souza', service: 'Corte de Cabelo', status: 'Confirmado' },
    { date: '13/06/2026', time: '11:00', client: 'Lucas Costa', service: 'Barba', status: 'Pendente' },
    { date: '14/06/2026', time: '15:00', client: 'Mariana Lima', service: 'Manicure', status: 'Confirmado' }
  ];

  appointments: any[] = [];

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

  // Registered Clients (Loaded dynamically)
  clients: any[] = [];

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
    if (appt.id) {
      if (typeof appt.id === 'string' && appt.id.startsWith('mock_')) {
        let mockAppts = JSON.parse(localStorage.getItem('mock_appointments') || '[]');
        mockAppts = mockAppts.map((a: any) => {
          if (a.id === appt.id) {
            a.status = 'CONFIRMED';
          }
          return a;
        });
        localStorage.setItem('mock_appointments', JSON.stringify(mockAppts));
        this.loadAppointments();
      } else {
        this.appointmentService.confirmAppointment(appt.id).subscribe({
          next: () => this.loadAppointments(),
          error: (err) => console.error('Erro ao confirmar agendamento:', err)
        });
      }
    } else {
      appt.status = 'Confirmado';
    }
  }

  cancelAppointment(appt: any) {
    if (appt.id) {
      if (typeof appt.id === 'string' && appt.id.startsWith('mock_')) {
        let mockAppts = JSON.parse(localStorage.getItem('mock_appointments') || '[]');
        mockAppts = mockAppts.map((a: any) => {
          if (a.id === appt.id) {
            a.status = 'CANCELLED';
          }
          return a;
        });
        localStorage.setItem('mock_appointments', JSON.stringify(mockAppts));
        this.loadAppointments();
      } else {
        this.appointmentService.cancelAppointment(appt.id).subscribe({
          next: () => this.loadAppointments(),
          error: (err) => console.error('Erro ao cancelar agendamento:', err)
        });
      }
    } else {
      appt.status = 'Cancelado';
    }
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
      const isActive = this.newClientData.status === 'Ativo';
      this.userService.setUserActive(this.editingClientRef.id, isActive).subscribe({
        next: () => {
          const updateData = {
            name: this.newClientData.name,
            email: this.newClientData.email,
            phone: this.newClientData.phone
          };
          this.userService.updateUser(this.editingClientRef.id, updateData).subscribe({
            next: (updatedUser) => {
              this.editingClientRef.name = updatedUser.name;
              this.editingClientRef.email = updatedUser.email;
              this.editingClientRef.phone = updatedUser.phone || '';
              this.editingClientRef.status = updatedUser.isActive ? 'Ativo' : 'Bloqueado';
              this.closeClientModal();
            },
            error: (err) => {
              console.error('Erro ao atualizar dados cadastrais do cliente:', err);
              Object.assign(this.editingClientRef, this.newClientData);
              this.closeClientModal();
            }
          });
        },
        error: (err) => {
          console.error('Erro ao atualizar status do cliente:', err);
        }
      });
    }
  }

  ngOnInit() {
    this.updateActiveTabFromUrl();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveTabFromUrl();
    });
    this.loadClients();
  }

  updateActiveTabFromUrl() {
    const url = this.router.url;
    if (url.includes('/agenda/users')) {
      this.activeTab = 'Clientes';
    } else if (url.includes('/agenda/appointments')) {
      this.activeTab = 'Agendamentos';
    } else if (url.includes('/agenda/reports')) {
      this.activeTab = 'Relatórios';
    } else if (url.includes('/agenda/services')) {
      this.activeTab = 'Serviços';
    } else {
      this.activeTab = 'Dashboard';
    }
  }

  loadClients() {
    this.userService.getUsers(0, 1000).subscribe({
      next: (response) => {
        this.clients = response.content.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '(11) 99999-9999',
          joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-',
          status: user.isActive ? 'Ativo' : 'Bloqueado'
        }));
        this.clientCount = this.clients.length;
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
        this.loadAppointments();
      }
    });
  }

  mapStatusToFrontend(status: string): string {
    const statusMap: any = {
      'PENDING': 'Pendente',
      'SCHEDULED': 'Pendente',
      'CONFIRMED': 'Confirmado',
      'COMPLETED': 'Concluído',
      'CANCELLED': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  loadAppointments() {
    this.appointmentService.findAll().subscribe({
      next: (backendData) => {
        const mappedBackend = backendData.map((a: any) => ({
          id: a.id,
          date: new Date(a.scheduledAt).toLocaleDateString('pt-BR'),
          time: new Date(a.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          client: a.userName || 'Cliente',
          service: a.serviceName || 'Serviço',
          status: this.mapStatusToFrontend(a.status)
        }));

        const mockAppts = JSON.parse(localStorage.getItem('mock_appointments') || '[]').map((a: any) => {
          const clientObj = this.clients.find(c => String(c.id) === String(a.userId));
          const clientName = clientObj ? clientObj.name : 'Cliente MOCK';
          return {
            id: a.id,
            date: new Date(a.scheduledAt).toLocaleDateString('pt-BR'),
            time: new Date(a.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            client: clientName,
            service: a.serviceName || 'Serviço MOCK',
            status: this.mapStatusToFrontend(a.status)
          };
        });

        this.appointments = [...this.staticAppointments, ...mappedBackend, ...mockAppts];
        this.upcomingCount = this.appointments.filter(a => a.status === 'Pendente').length;
      },
      error: (err) => {
        console.error('Erro ao carregar agendamentos do backend, carregando mocks:', err);
        const mockAppts = JSON.parse(localStorage.getItem('mock_appointments') || '[]').map((a: any) => {
          const clientObj = this.clients.find(c => String(c.id) === String(a.userId));
          const clientName = clientObj ? clientObj.name : 'Cliente MOCK';
          return {
            id: a.id,
            date: new Date(a.scheduledAt).toLocaleDateString('pt-BR'),
            time: new Date(a.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            client: clientName,
            service: a.serviceName || 'Serviço MOCK',
            status: this.mapStatusToFrontend(a.status)
          };
        });

        this.appointments = [...this.staticAppointments, ...mockAppts];
        this.upcomingCount = this.appointments.filter(a => a.status === 'Pendente').length;
      }
    });
  }

  private parsePrice(priceStr: string | number): number {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    const cleaned = priceStr.replace('R$', '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  get serviceStats() {
    const statsMap = new Map<string, { count: number; confirmedCount: number; revenue: number }>();
    
    // Initialize map for all services in the catalog
    this.services.forEach(s => {
      statsMap.set(s.name, { count: 0, confirmedCount: 0, revenue: 0 });
    });

    let totalBookings = 0;
    let totalRevenue = 0;

    // Aggregate stats from appointments
    this.appointments.forEach(appt => {
      const serviceName = appt.service;
      const status = appt.status; // 'Confirmado', 'Pendente', 'Cancelado'
      
      const serviceObj = this.services.find(s => s.name === serviceName);
      const priceVal = serviceObj ? this.parsePrice(serviceObj.price) : 0;

      if (!statsMap.has(serviceName)) {
        statsMap.set(serviceName, { count: 0, confirmedCount: 0, revenue: 0 });
      }

      const statObj = statsMap.get(serviceName)!;
      
      if (status !== 'Cancelado') {
        statObj.count++;
        totalBookings++;
        
        if (status === 'Confirmado') {
          statObj.confirmedCount++;
          statObj.revenue += priceVal;
          totalRevenue += priceVal;
        }
      }
    });

    // Create the structured list
    const list = this.services.map(s => {
      const statObj = statsMap.get(s.name) || { count: 0, confirmedCount: 0, revenue: 0 };
      const percentage = totalBookings > 0 ? (statObj.count / totalBookings) * 100 : 0;
      return {
        name: s.name,
        category: s.category,
        price: s.price,
        count: statObj.count,
        confirmedCount: statObj.confirmedCount,
        revenue: statObj.revenue,
        percentage: percentage
      };
    });

    // Sort descending by booking count
    list.sort((a, b) => b.count - a.count);

    const mostPopular = list.length > 0 && list[0].count > 0 ? list[0].name : 'Nenhum agendamento';
    const avgTicket = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    return {
      list,
      totalBookings,
      totalRevenue,
      mostPopularService: mostPopular,
      avgTicket
    };
  }

  selectTab(tabName: string) {
    this.activeTab = tabName;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

