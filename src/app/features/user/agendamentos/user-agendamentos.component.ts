import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/integration/auth/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../core/integration/user/user.service';
import { AppointmentService } from '../../../core/integration/appointment/appointment.service';
import { ServiceService } from '../../../core/integration/service.service';
import { MaterialModule } from '../../../material/material.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-user-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }
  ],
  templateUrl: './user-agendamentos.component.html',
  styleUrls: ['./user-agendamentos.component.scss']
})
export class UserAgendamentosComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private userService = inject(UserService);
  private appointmentService = inject(AppointmentService);
  private serviceService = inject(ServiceService);

  userName = '';
  successMsg = '';

  activeTab = 'agendamentos';
  showBookingModal = false;

  // Profile Form State
  isUpdatingProfile = false;
  profileErrorMsg = '';
  profileSuccessMsg = '';
  profileData = {
    name: '',
    email: '',
    phone: ''
  };

  // Form selections
  selectedService: any = null;
  selectedProfessional = '';
  selectedDate = '2026-06-15';
  selectedDateObj: any = null;
  minDateObj = new Date();
  selectedSlot = '';

  // Options
  services: any[] = [
    { id: '1', name: 'Corte de Cabelo', duration: '30 min', price: 'R$ 50,00', category: 'Cabelo' },
    { id: '2', name: 'Coloração', duration: '90 min', price: 'R$ 150,00', category: 'Cabelo' },
    { id: '3', name: 'Manicure', duration: '45 min', price: 'R$ 40,00', category: 'Unhas' },
    { id: '4', name: 'Barba', duration: '30 min', price: 'R$ 35,00', category: 'Barba' }
  ];

  professionals = [
    'Carlos Silva (Especialista em Cabelo)',
    'Ana Oliveira (Especialista em Coloração)',
    'Marcos Souza (Manicure/Pedicure)'
  ];

  availableSlots: string[] = [];

  // Scheduled appointments tracking
  myAppointments: any[] = [];

  // Pagination for "Meus Agendamentos"
  myAppointmentsPage: number = 1;
  myAppointmentsPageSize: number = 3;

  // Pagination for "Histórico Recente" (aba Relatórios)
  historyPage: number = 1;
  historyPageSize: number = 5;

  get totalMyAppointmentsPages(): number {
    const total = Math.ceil(this.myAppointments.length / this.myAppointmentsPageSize);
    return total > 0 ? total : 1;
  }

  get paginatedMyAppointments() {
    const maxPage = this.totalMyAppointmentsPages;
    if (this.myAppointmentsPage > maxPage) {
      this.myAppointmentsPage = maxPage;
    }
    const startIndex = (this.myAppointmentsPage - 1) * this.myAppointmentsPageSize;
    return this.myAppointments.slice(startIndex, startIndex + this.myAppointmentsPageSize);
  }

  get totalHistoryPages(): number {
    const total = Math.ceil(this.myAppointments.length / this.historyPageSize);
    return total > 0 ? total : 1;
  }

  get paginatedHistory() {
    const maxPage = this.totalHistoryPages;
    if (this.historyPage > maxPage) {
      this.historyPage = maxPage;
    }
    const startIndex = (this.historyPage - 1) * this.historyPageSize;
    return this.myAppointments.slice(startIndex, startIndex + this.historyPageSize);
  }

  // ===== Contadores da aba Relatórios =====
  get reportTotalCount(): number {
    return this.myAppointments.length;
  }

  get reportScheduledCount(): number {
    return this.myAppointments.filter(a =>
      a.status === 'Agendado' || a.status === 'Pendente' || a.status === 'Confirmado'
    ).length;
  }

  get reportCompletedCount(): number {
    return this.myAppointments.filter(a => a.status === 'Concluído').length;
  }

  get reportCancelledCount(): number {
    return this.myAppointments.filter(a => a.status === 'Cancelado').length;
  }

  get reportTotalSpent(): number {
    return this.myAppointments
      .filter(a => a.status !== 'Cancelado')
      .reduce((sum, a) => sum + (a.priceValue || 0), 0);
  }

  get reportTotalSpentLabel(): string {
    return this.formatCurrency(this.reportTotalSpent);
  }


  ngOnInit() {
    const user = this.authService.getUser();
    this.userName = user ? user.name : 'Cliente';
    if (user) {
      this.profileData.name = user.name || '';
      this.profileData.email = user.email || '';
      this.profileData.phone = user.phone || '';
    }
    this.loadServices();
    this.loadAppointments();

    this.appointmentService.appointmentCreated$.subscribe(() => {
      this.loadAppointments();
    });
  }

  selectTab(tabName: string) {
    this.activeTab = tabName;
    if (tabName === 'configuracoes') {
      const user = this.authService.getUser();
      if (user) {
        this.profileData = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        };
      }
      this.profileErrorMsg = '';
      this.profileSuccessMsg = '';
    }
  }

  updateProfile() {
    if (!this.profileData.email || !this.profileData.phone) {
      return;
    }

    this.isUpdatingProfile = true;
    this.profileErrorMsg = '';
    this.profileSuccessMsg = '';

    const userId = this.authService.getUserId() || '';
    const updatePayload = {
      name: this.profileData.name,
      email: this.profileData.email,
      phone: this.profileData.phone
    };

    this.userService.updateUser(userId, updatePayload).subscribe({
      next: (updatedUser) => {
        this.isUpdatingProfile = false;
        this.profileSuccessMsg = 'Cadastro atualizado com sucesso!';
        this.userName = updatedUser.name;

        // Update the user stored in localStorage
        const currentUser = this.authService.getUser();
        if (currentUser) {
          currentUser.name = updatedUser.name;
          currentUser.email = updatedUser.email;
          currentUser.phone = updatedUser.phone || '';
          localStorage.setItem('user', JSON.stringify(currentUser));
        }

        setTimeout(() => {
          this.profileSuccessMsg = '';
        }, 3000);
      },
      error: (err) => {
        this.isUpdatingProfile = false;
        console.error('Erro ao atualizar perfil:', err);

        if (userId === 'cliente-id' || userId === 'cliente@agenda.com') {
          // Fallback for mock environment
          this.profileSuccessMsg = 'Cadastro atualizado com sucesso (Mock)!';
          this.userName = this.profileData.name;

          const currentUser = this.authService.getUser();
          if (currentUser) {
            currentUser.email = this.profileData.email;
            currentUser.phone = this.profileData.phone;
            localStorage.setItem('user', JSON.stringify(currentUser));
          }

          setTimeout(() => {
            this.profileSuccessMsg = '';
          }, 3000);
        } else {
          this.profileErrorMsg = err.error?.message || 'Erro ao atualizar cadastro. Tente novamente.';
        }
      }
    });
  }

  selectService(service: any) {
    this.selectedService = service;
    this.selectedSlot = ''; // Reset slot selection
    this.onServiceOrDateChange();
  }

  onServiceChange(serviceId: string) {
    if (!serviceId) {
      this.selectedService = null;
    } else {
      this.selectedService = this.services.find(s => String(s.id) === serviceId) || null;
    }
    this.selectedSlot = ''; // Reset slot selection
    this.selectedProfessional = ''; // Reset professional selection
    this.onServiceOrDateChange();
  }

  onServiceOrDateChange() {
    this.selectedSlot = '';
    this.availableSlots = [];

    if (this.selectedService && this.selectedDate) {
      this.appointmentService.getAvailableSlots(this.selectedDate, String(this.selectedService.id)).subscribe({
        next: (slots) => {
          this.availableSlots = slots
            .filter(s => s.available)
            .map(s => s.startTime.slice(0, 5));
        },
        error: () => {
          // Fallback to default mock slots
          this.availableSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
        }
      });
    }
  }

  onDateChange(event: any) {
    const dateValue = event.value;
    if (dateValue && typeof dateValue.format === 'function') {
      this.selectedDate = dateValue.format('YYYY-MM-DD');
    } else if (dateValue instanceof Date) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      this.selectedDate = `${year}-${month}-${day}`;
    } else {
      this.selectedDate = '';
    }
    this.onServiceOrDateChange();
  }

  selectSlot(slot: string) {
    this.selectedSlot = slot;
  }

  openBookingModal() {
    this.selectedService = null;
    this.selectedProfessional = '';
    this.selectedSlot = '';
    this.selectedDate = '';
    this.selectedDateObj = null;
    this.availableSlots = [];
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
  }

  confirmBooking() {
    if (!this.selectedService || !this.selectedProfessional || !this.selectedDate || !this.selectedSlot) {
      return;
    }

    const userId = this.authService.getUserId() || '';
    const scheduledSlot = this.selectedSlot.length === 5 ? `${this.selectedSlot}:00` : this.selectedSlot;
    const scheduledAt = `${this.selectedDate}T${scheduledSlot}`;

    const payload = {
      userId: userId,
      serviceId: String(this.selectedService.id),
      scheduledAt: scheduledAt,
      notes: ''
    };

    const formattedDate = new Date(this.selectedDate).toLocaleDateString('pt-BR');
    const displayTime = this.selectedSlot.slice(0, 5);

    this.appointmentService.createAppointment(payload).subscribe({
      next: () => {
        this.successMsg = `Agendamento de ${this.selectedService.name} confirmado com sucesso para dia ${formattedDate} às ${displayTime}!`;
        this.appointmentService.notifyAppointmentCreated();

        // Close modal and reset selections
        this.closeBookingModal();
        this.selectedService = null;
        this.selectedProfessional = '';
        this.selectedSlot = '';

        setTimeout(() => {
          this.successMsg = '';
        }, 4000);
      },
      error: (err) => {
        console.warn('Erro ao criar agendamento na API, usando mock local:', err);
        // Fallback for mock/offline environment
        const mockAppt = {
          id: 'mock_' + Date.now(),
          userId: userId,
          serviceId: String(this.selectedService.id),
          serviceName: this.selectedService.name,
          scheduledAt: scheduledAt,
          status: 'SCHEDULED',
          professional: this.selectedProfessional.split(' (')[0],
          notes: ''
        };
        const mockAppts = JSON.parse(localStorage.getItem('mock_appointments') || '[]');
        mockAppts.push(mockAppt);
        localStorage.setItem('mock_appointments', JSON.stringify(mockAppts));

        this.successMsg = `Agendamento de ${this.selectedService.name} confirmado com sucesso para dia ${formattedDate} às ${displayTime}!`;
        this.appointmentService.notifyAppointmentCreated();

        // Close modal and reset selections
        this.closeBookingModal();
        this.selectedService = null;
        this.selectedProfessional = '';
        this.selectedSlot = '';

        setTimeout(() => {
          this.successMsg = '';
        }, 4000);
      }
    });
  }

  loadServices() {
    this.serviceService.getServices().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.services = data;
        }
      },
      error: (err) => {
        console.error('Erro ao carregar serviços:', err);
      }
    });
  }

  loadAppointments() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.appointmentService.getUserAppointments(userId).subscribe({
      next: (data) => {
        const mockAppts = JSON.parse(localStorage.getItem('mock_appointments') || '[]')
          .filter((a: any) => a.userId === userId);
        const merged = [...data, ...mockAppts];

        // Sort by date descending
        const sorted = merged.sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

        this.myAppointments = sorted.map((appt: any) => {
          const dateObj = new Date(appt.scheduledAt);
          const formattedDate = dateObj.toLocaleDateString('pt-BR');
          const formattedTime = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          const serviceName = appt.serviceName || appt.service?.name || 'Serviço';
          const priceValue = this.getServicePriceValue(serviceName, appt.service?.price ?? appt.price);

          return {
            id: appt.id,
            service: serviceName,
            date: formattedDate,
            time: formattedTime,
            professional: appt.professional || 'Carlos Silva',
            status: this.translateStatus(appt.status),
            priceValue: priceValue,
            priceLabel: this.formatCurrency(priceValue)
          };
        });
      },
      error: (err) => {
        console.error('Erro ao carregar agendamentos:', err);
        const mockAppts = JSON.parse(localStorage.getItem('mock_appointments') || '[]')
          .filter((a: any) => a.userId === userId);
        const sorted = mockAppts.sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

        this.myAppointments = sorted.map((appt: any) => {
          const dateObj = new Date(appt.scheduledAt);
          const serviceName = appt.serviceName || 'Serviço';
          const priceValue = this.getServicePriceValue(serviceName, appt.price);
          return {
            id: appt.id,
            service: serviceName,
            date: dateObj.toLocaleDateString('pt-BR'),
            time: dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            professional: appt.professional || 'Carlos Silva',
            status: this.translateStatus(appt.status),
            priceValue: priceValue,
            priceLabel: this.formatCurrency(priceValue)
          };
        });
      }
    });
  }

  translateStatus(status: string): string {
    const statusMap: any = {
      'SCHEDULED': 'Agendado',
      'PENDING': 'Pendente',
      'COMPLETED': 'Concluído',
      'CANCELLED': 'Cancelado',
      'CONFIRMED': 'Confirmado'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase() === 'agendado' ? 'badge-scheduled' : 'badge-completed';
  }

  /** Procura o preço de um serviço pelo nome (com fallback) e devolve um número. */
  getServicePriceValue(serviceName: string, fallback?: any): number {
    const found = this.services.find(s => s.name === serviceName);
    const raw = found?.price ?? fallback;
    if (raw === undefined || raw === null) return 0;
    if (typeof raw === 'number') return raw;
    // "R$ 50,00" -> 50.00
    const cleaned = String(raw).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
    const value = parseFloat(cleaned);
    return isNaN(value) ? 0 : value;
  }

  /** Formata um número como moeda BRL. */
  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  /** Gera e baixa o histórico de agendamentos do usuário em PDF. */
  downloadHistoryPDF(): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const issueDate = new Date().toLocaleDateString('pt-BR');

    // ---- Cabeçalho ----
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AgendaService', 14, 12);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Histórico de Agendamentos', 14, 20);

    // ---- Informações do cliente ----
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Cliente: ${this.userName || '-'}`, 14, 40);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.text(`Data de emissão: ${issueDate}`, 14, 47);
    doc.text(`Total de agendamentos: ${this.reportTotalCount}`, 14, 53);
    doc.text(`Total de gastos: ${this.reportTotalSpentLabel}`, 14, 59);

    // ---- Tabela ----
    const tableData = this.myAppointments.map(appt => [
      appt.service,
      appt.professional,
      appt.date,
      appt.time,
      appt.priceLabel || '-',
      appt.status
    ]);

    if (tableData.length === 0) {
      doc.setTextColor(100, 116, 139);
      doc.text('Nenhum agendamento registrado.', 14, 75);
    } else {
      autoTable(doc, {
        head: [['Serviço', 'Profissional', 'Data', 'Horário', 'Valor', 'Status']],
        body: tableData,
        startY: 68,
        theme: 'striped',
        headStyles: {
          fillColor: [30, 58, 138],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: { textColor: [51, 65, 85] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          4: { halign: 'right', fontStyle: 'bold' },
          5: { halign: 'center' }
        }
      });
    }

    // ---- Rodapé com total ----
    const finalY = (doc as any).lastAutoTable?.finalY ?? 75;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(`Total geral (não cancelados): ${this.reportTotalSpentLabel}`, 14, finalY + 12);

    // Salvar
    const filename = `historico-agendamentos-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);

    this.successMsg = 'PDF gerado e baixado com sucesso!';
    setTimeout(() => { this.successMsg = ''; }, 3000);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
