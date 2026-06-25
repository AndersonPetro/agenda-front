import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/integration/auth/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../core/integration/user/user.service';
import { AppointmentService } from '../../../core/integration/appointment/appointment.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.scss']
})
export class EmployeeDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private userService = inject(UserService);
  private appointmentService = inject(AppointmentService);

  employeeName = '';
  activeTab = 'agenda'; // tabs: 'agenda', 'clientes', 'configuracoes'
  successMsg = '';
  errorMsg = '';

  // Filter & Search states
  searchTerm = '';
  statusFilter = '';
  dateFilter = '';
  showOnlyMine = true;

  // Pagination states
  currentPage = 1;
  pageSize = 5;

  clientsPage = 1;
  clientsPageSize = 5;

  // Selected appointment for notes editing
  selectedApptForNotes: any = null;
  apptNotesText = '';
  showNotesModal = false;

  // Availability Mock settings
  availabilityStatus = 'ATIVO'; // ATIVO, PAUSA, AUSENTE
  workingHoursStart = '09:00';
  workingHoursEnd = '18:00';

  // Static appointments (for fallback & simulation)
  staticAppointments = [
    { id: 'static_1', date: '11/06/2026', time: '09:00', client: 'Carlos Silva', service: 'Corte de Cabelo', status: 'Confirmado', notes: 'Prefere corte com tesoura', professional: 'Carlos Silva' },
    { id: 'static_2', date: '11/06/2026', time: '10:30', client: 'Ana Oliveira', service: 'Coloração', status: 'Confirmado', notes: 'Tom loiro acinzentado', professional: 'Ana Oliveira' },
    { id: 'static_3', date: '12/06/2026', time: '14:00', client: 'João Santos', service: 'Manicure', status: 'Pendente', notes: 'Trazer esmalte próprio', professional: 'Marcos Souza' },
    { id: 'static_4', date: '12/06/2026', time: '16:15', client: 'Maria Pereira', service: 'Barba', status: 'Confirmado', notes: 'Modelagem completa', professional: 'Carlos Silva' },
    { id: 'static_5', date: '13/06/2026', time: '09:30', client: 'Pedro Souza', service: 'Corte de Cabelo', status: 'Confirmado', notes: '', professional: 'Carlos Silva' },
    { id: 'static_6', date: '13/06/2026', time: '11:00', client: 'Lucas Costa', service: 'Barba', status: 'Pendente', notes: '', professional: 'Carlos Silva' },
    { id: 'static_7', date: '14/06/2026', time: '15:00', client: 'Mariana Lima', service: 'Manicure', status: 'Confirmado', notes: 'Decoração floral', professional: 'Marcos Souza' }
  ];

  // Lists loaded from APIs
  clients: any[] = [];
  appointments: any[] = [];

  ngOnInit() {
    const user = this.authService.getUser();
    this.employeeName = user ? user.name : 'Funcionário';

    // Load data
    this.loadClients();
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
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Erro ao carregar clientes:', err);
        this.loadAppointments();
      }
    });
  }

  loadAppointments() {
    this.appointmentService.findAll().subscribe({
      next: (backendData) => {
        const mappedBackend = backendData.map((a: any) => ({
          id: a.id,
          userId: a.userId,
          date: new Date(a.scheduledAt).toLocaleDateString('pt-BR'),
          time: new Date(a.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          rawDate: a.scheduledAt.split('T')[0],
          client: a.userName || 'Cliente',
          service: a.serviceName || 'Serviço',
          status: this.mapStatusToFrontend(a.status),
          notes: a.notes || '',
          professional: a.professional || this.inferProfessionalFromService(a.serviceName)
        }));

        const mockAppts = JSON.parse(localStorage.getItem('mock_appointments') || '[]').map((a: any) => {
          const clientObj = this.clients.find(c => String(c.id) === String(a.userId));
          const clientName = clientObj ? clientObj.name : 'Cliente MOCK';
          return {
            id: a.id,
            userId: a.userId,
            date: new Date(a.scheduledAt).toLocaleDateString('pt-BR'),
            time: new Date(a.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            rawDate: a.scheduledAt.split('T')[0],
            client: clientName,
            service: a.serviceName || 'Serviço MOCK',
            status: this.mapStatusToFrontend(a.status),
            notes: a.notes || '',
            professional: a.professional || 'Carlos Silva'
          };
        });

        this.appointments = [...this.staticAppointments, ...mappedBackend, ...mockAppts];
        this.sortAppointmentsByDate();
      },
      error: (err) => {
        console.error('Erro ao carregar agendamentos do backend, carregando mocks:', err);
        const mockAppts = JSON.parse(localStorage.getItem('mock_appointments') || '[]').map((a: any) => {
          const clientObj = this.clients.find(c => String(c.id) === String(a.userId));
          const clientName = clientObj ? clientObj.name : 'Cliente MOCK';
          return {
            id: a.id,
            userId: a.userId,
            date: new Date(a.scheduledAt).toLocaleDateString('pt-BR'),
            time: new Date(a.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            rawDate: a.scheduledAt.split('T')[0],
            client: clientName,
            service: a.serviceName || 'Serviço MOCK',
            status: this.mapStatusToFrontend(a.status),
            notes: a.notes || '',
            professional: a.professional || 'Carlos Silva'
          };
        });

        this.appointments = [...this.staticAppointments, ...mockAppts];
        this.sortAppointmentsByDate();
      }
    });
  }

  sortAppointmentsByDate() {
    this.appointments.sort((a, b) => {
      // Sort by date then by time
      const dateA = this.parseDateString(a.date);
      const dateB = this.parseDateString(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime(); // Descending by date (most recent first)
      }
      return a.time.localeCompare(b.time); // Ascending by time
    });
  }

  parseDateString(dateStr: string): Date {
    // Converts "DD/MM/YYYY" to Date object
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    }
    return new Date();
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

  inferProfessionalFromService(serviceName: string): string {
    const name = serviceName ? serviceName.toLowerCase() : '';
    if (name.includes('coloração') || name.includes('tintura')) {
      return 'Ana Oliveira';
    } else if (name.includes('manicure') || name.includes('pedicure') || name.includes('unha')) {
      return 'Marcos Souza';
    } else {
      return 'Carlos Silva'; // Default professional
    }
  }

  isAssignedToMe(appt: any): boolean {
    const myName = this.employeeName.toLowerCase();
    if (!appt.professional) return false;
    const profName = appt.professional.toLowerCase();

    // Check if my name contains the professional name or vice-versa
    const firstName = myName.split(' ')[0];
    return profName.includes(firstName) || myName.includes(profName);
  }

  // Filtered lists
  get filteredAppointments() {
    let result = this.appointments;

    // Filter by assignee
    if (this.showOnlyMine) {
      result = result.filter(a => this.isAssignedToMe(a));
    }

    // Search by client name or service
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(a =>
        a.client.toLowerCase().includes(term) ||
        a.service.toLowerCase().includes(term) ||
        (a.notes && a.notes.toLowerCase().includes(term))
      );
    }

    // Filter by status
    if (this.statusFilter) {
      result = result.filter(a => a.status.toLowerCase() === this.statusFilter.toLowerCase());
    }

    // Filter by date
    if (this.dateFilter) {
      // Date filter is YYYY-MM-DD
      const dateParts = this.dateFilter.split('-');
      const formattedFilterDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      result = result.filter(a => a.date === formattedFilterDate);
    }

    return result;
  }

  get paginatedAppointments() {
    const filtered = this.filteredAppointments;
    const totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > totalPages && totalPages > 0) {
      this.currentPage = totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(startIndex, startIndex + this.pageSize);
  }

  get totalApptPages() {
    const total = Math.ceil(this.filteredAppointments.length / this.pageSize);
    return total > 0 ? total : 1;
  }

  // Clients tab logic: Unique clients for the professional
  get myClientsList() {
    // If showOnlyMine, get clients of this professional. Otherwise get all clients.
    const appts = this.showOnlyMine ? this.appointments.filter(a => this.isAssignedToMe(a)) : this.appointments;
    const clientMap = new Map<string, any>();

    appts.forEach(appt => {
      // Match by userId if available, else match by client name
      const key = appt.userId || appt.client;
      if (!clientMap.has(key)) {
        const clientDetail = this.clients.find(c => String(c.id) === String(appt.userId) || c.name === appt.client) || {
          name: appt.client,
          email: 'Não cadastrado',
          phone: '(11) 99999-9999',
          status: 'Ativo'
        };
        clientMap.set(key, {
          ...clientDetail,
          totalAppointments: 0,
          lastService: appt.service,
          lastDate: appt.date
        });
      }

      const clientInfo = clientMap.get(key);
      clientInfo.totalAppointments++;
      // Since appointments are sorted descending by date, the first one encountered will be the most recent
      // But let's verify if we need to update lastDate/lastService
      const currentLast = this.parseDateString(clientInfo.lastDate);
      const apptDate = this.parseDateString(appt.date);
      if (apptDate.getTime() >= currentLast.getTime()) {
        clientInfo.lastDate = appt.date;
        clientInfo.lastService = appt.service;
      }
    });

    return Array.from(clientMap.values());
  }

  get filteredClientsList() {
    let result = this.myClientsList;
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      result = result.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.toLowerCase().includes(term)
      );
    }
    return result;
  }

  get paginatedClientsList() {
    const list = this.filteredClientsList;
    const totalPages = Math.ceil(list.length / this.clientsPageSize);
    if (this.clientsPage > totalPages && totalPages > 0) {
      this.clientsPage = totalPages;
    }
    const startIndex = (this.clientsPage - 1) * this.clientsPageSize;
    return list.slice(startIndex, startIndex + this.clientsPageSize);
  }

  get totalClientsPages() {
    const total = Math.ceil(this.filteredClientsList.length / this.clientsPageSize);
    return total > 0 ? total : 1;
  }

  // Dashboard Stats indicators (for currently selected scope: Mine vs All)
  get stats() {
    const scopeAppts = this.showOnlyMine ? this.appointments.filter(a => this.isAssignedToMe(a)) : this.appointments;

    // Today's appointments count
    const todayStr = new Date().toLocaleDateString('pt-BR');
    const todayCount = scopeAppts.filter(a => a.date === todayStr).length;

    const confirmedCount = scopeAppts.filter(a => a.status === 'Confirmado').length;
    const pendingCount = scopeAppts.filter(a => a.status === 'Pendente').length;
    const clientsCount = this.myClientsList.length;

    return {
      todayCount,
      confirmedCount,
      pendingCount,
      clientsCount
    };
  }

  // Actions
  confirmAppointment(appt: any) {
    if (String(appt.id).startsWith('mock_') || String(appt.id).startsWith('static_')) {
      appt.status = 'Confirmado';
      if (String(appt.id).startsWith('mock_')) {
        this.updateMockStatus(appt.id, 'CONFIRMED');
      }
      this.showToast('Agendamento confirmado com sucesso!');
    } else {
      this.appointmentService.confirmAppointment(appt.id).subscribe({
        next: () => {
          appt.status = 'Confirmado';
          this.showToast('Agendamento confirmado com sucesso!');
          this.loadAppointments();
        },
        error: (err) => {
          console.error(err);
          this.showError('Erro ao confirmar agendamento.');
        }
      });
    }
  }

  completeAppointment(appt: any) {
    if (String(appt.id).startsWith('mock_') || String(appt.id).startsWith('static_')) {
      appt.status = 'Concluído';
      if (String(appt.id).startsWith('mock_')) {
        this.updateMockStatus(appt.id, 'COMPLETED');
      }
      this.showToast('Serviço concluído com sucesso!');
    } else {
      this.appointmentService.completeAppointment(appt.id).subscribe({
        next: () => {
          appt.status = 'Concluído';
          this.showToast('Serviço concluído com sucesso!');
          this.loadAppointments();
        },
        error: (err) => {
          console.error(err);
          this.showError('Erro ao concluir agendamento.');
        }
      });
    }
  }

  cancelAppointment(appt: any) {
    if (String(appt.id).startsWith('mock_') || String(appt.id).startsWith('static_')) {
      appt.status = 'Cancelado';
      if (String(appt.id).startsWith('mock_')) {
        this.updateMockStatus(appt.id, 'CANCELLED');
      }
      this.showToast('Agendamento cancelado.');
    } else {
      this.appointmentService.cancelAppointment(appt.id).subscribe({
        next: () => {
          appt.status = 'Cancelado';
          this.showToast('Agendamento cancelado.');
          this.loadAppointments();
        },
        error: (err) => {
          console.error(err);
          this.showError('Erro ao cancelar agendamento.');
        }
      });
    }
  }

  openNotesModal(appt: any) {
    this.selectedApptForNotes = appt;
    this.apptNotesText = appt.notes || '';
    this.showNotesModal = true;
  }

  closeNotesModal() {
    this.showNotesModal = false;
    this.selectedApptForNotes = null;
    this.apptNotesText = '';
  }

  saveNotes() {
    if (!this.selectedApptForNotes) return;
    const appt = this.selectedApptForNotes;

    if (String(appt.id).startsWith('mock_') || String(appt.id).startsWith('static_')) {
      appt.notes = this.apptNotesText;
      if (String(appt.id).startsWith('mock_')) {
        this.updateMockNotes(appt.id, this.apptNotesText);
      }
      this.showToast('Observações salvas com sucesso!');
      this.closeNotesModal();
    } else {
      this.appointmentService.updateAppointment(appt.id, { notes: this.apptNotesText }).subscribe({
        next: (updated) => {
          appt.notes = updated.notes;
          this.showToast('Observações salvas com sucesso!');
          this.closeNotesModal();
          this.loadAppointments();
        },
        error: (err) => {
          console.error(err);
          this.showError('Erro ao salvar observações.');
        }
      });
    }
  }

  updateMockStatus(apptId: string, newStatus: string) {
    let mockAppts = JSON.parse(localStorage.getItem('mock_appointments') || '[]');
    mockAppts = mockAppts.map((a: any) => {
      if (a.id === apptId) {
        a.status = newStatus;
      }
      return a;
    });
    localStorage.setItem('mock_appointments', JSON.stringify(mockAppts));
  }

  updateMockNotes(apptId: string, notes: string) {
    let mockAppts = JSON.parse(localStorage.getItem('mock_appointments') || '[]');
    mockAppts = mockAppts.map((a: any) => {
      if (a.id === apptId) {
        a.notes = notes;
      }
      return a;
    });
    localStorage.setItem('mock_appointments', JSON.stringify(mockAppts));
  }

  // Toast utilities
  showToast(msg: string) {
    this.successMsg = msg;
    setTimeout(() => this.successMsg = '', 3000);
  }

  showError(msg: string) {
    this.errorMsg = msg;
    setTimeout(() => this.errorMsg = '', 3000);
  }

  // Tab switching
  selectTab(tab: string) {
    this.activeTab = tab;
    this.searchTerm = '';
    this.currentPage = 1;
    this.clientsPage = 1;
  }

  // PDF Export
  downloadAgendaPDF() {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const dateStr = new Date().toLocaleDateString('pt-BR');
      const scopeLabel = this.showOnlyMine ? `Profissional: ${this.employeeName}` : 'Salão Inteiro';

      // Header
      doc.setFillColor(15, 23, 42); // Dark slate
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AgendaService - Profissionais', 14, 12);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Relatório de Agendamentos - ${scopeLabel}`, 14, 20);

      // Metadata
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(10);
      doc.text(`Gerado em: ${dateStr}`, 14, 40);
      doc.text(`Total de compromissos listados: ${this.filteredAppointments.length}`, 14, 46);

      // Table Data
      const tableHeaders = [['Data', 'Hora', 'Cliente', 'Serviço', 'Profissional', 'Status']];
      const tableRows = this.filteredAppointments.map(a => [
        a.date || '-',
        a.time || '-',
        a.client || '-',
        a.service || '-',
        a.professional || '-',
        a.status || '-'
      ]);

      if (tableRows.length === 0) {
        doc.text('Nenhum agendamento encontrado para os filtros selecionados.', 14, 60);
      } else {
        autoTable(doc, {
          head: tableHeaders,
          body: tableRows,
          startY: 52,
          theme: 'striped',
          headStyles: {
            fillColor: [30, 58, 138], // Navy Blue
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'left'
          },
          bodyStyles: { textColor: [51, 65, 85] },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          styles: { fontSize: 9, cellPadding: 4 }
        });
      }

      // Safe ASCII-only filename to avoid encoding issues
      const filename = `agenda-profissional-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      this.showToast('PDF gerado e baixado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao gerar PDF:', err);
      this.showError('Erro ao gerar PDF: ' + (err.message || err));
    }
  }

  // Update Settings Mock
  saveSettings() {
    this.showToast('Configurações de disponibilidade atualizadas com sucesso!');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
