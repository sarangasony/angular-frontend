import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskFormDialogComponent } from '../task-form-dialog/task-form-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class TaskComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'id',
    'title',
    'status',
    'due_date',
    'created_at',
    'actions',
  ];
  dataSource = new MatTableDataSource<Task>();
  allTasks: Task[] = [];

  isLoading = true;
  statuses = TaskStatus;
  currentStatusFilter: 'all' | TaskStatus = 'all';
  currentSearchText: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') searchInput!: ElementRef;

  constructor(
    private taskService: TaskService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    setTimeout(() => {
      this.currentSearchText =
        this.searchInput?.nativeElement.value?.trim().toLowerCase() || '';
      this.applyFilter();
    });
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        this.allTasks = tasks;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load tasks', err);
        this.snackBar.open('Failed to load tasks!', 'Close', {
          duration: 3000,
        });
        this.isLoading = false;
      },
    });
  }

  onSearchChange(): void {
    this.currentSearchText =
      this.searchInput?.nativeElement.value?.trim().toLowerCase() || '';
    this.applyFilter();
  }

  setStatusFilter(status: 'all' | TaskStatus): void {
    this.currentStatusFilter = status;
    this.currentSearchText =
      this.searchInput?.nativeElement.value?.trim().toLowerCase() || '';
    this.applyFilter();
  }

  applyFilter(): void {
    const filtered = this.allTasks.filter((task) => {
      const statusMatch =
        this.currentStatusFilter === 'all' ||
        task.status.toLowerCase() === this.currentStatusFilter.toLowerCase();

      const searchMatch =
        task.title.toLowerCase().includes(this.currentSearchText) ||
        (task.description &&
          task.description.toLowerCase().includes(this.currentSearchText));

      return statusMatch && searchMatch;
    });

    this.dataSource.data = filtered;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openAddTaskDialog(): void {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '500px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { user_id, title, description, status, due_date } = result;
        this.taskService
          .addTask({ user_id, title, description, status, due_date })
          .subscribe({
            next: () => {
              this.snackBar.open('Task added successfully!', 'Close', {
                duration: 3000,
              });
              this.loadTasks();
            },
            error: (err) => {
              console.error('Error adding task', err);
              this.snackBar.open('Failed to add task!', 'Close', {
                duration: 3000,
              });
            },
          });
      }
    });
  }

  openEditTaskDialog(task: Task): void {
    const dialogRef = this.dialog.open(TaskFormDialogComponent, {
      width: '500px',
      data: { task: { ...task } },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.updateTask(result).subscribe({
          next: () => {
            this.snackBar.open('Task updated successfully!', 'Close', {
              duration: 3000,
            });
            this.loadTasks();
          },
          error: (err) => {
            console.error('Error updating task', err);
            this.snackBar.open('Failed to update task!', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  openDeleteConfirmDialog(task: Task): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Deletion',
        message: `Are you sure you want to delete the task "${task.title}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            this.snackBar.open('Task deleted successfully!', 'Close', {
              duration: 3000,
            });
            this.loadTasks();
          },
          error: (err) => {
            console.error('Error deleting task', err);
            this.snackBar.open('Failed to delete task!', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }
}
