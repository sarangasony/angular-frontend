import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskComponent } from './task.component';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TaskService } from '../../services/task.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import {  TaskResponse, TaskStatus } from '../../models/task.model'; // Adjust path if needed
// ------------------------------------

describe('TaskComponent', () => {
  let component: TaskComponent;
  let fixture: ComponentFixture<TaskComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'deleteTask', 'updateTask', 'markTaskComplete']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    const mockTasksResponse: TaskResponse = {
      data: [
        { id: 1, user_id: 1, title: 'Mock Task 1', description: 'Desc 1', status: TaskStatus.Pending, due_date: '2025-07-01' },
        { id: 2, user_id: 1, title: 'Mock Task 2', description: 'Desc 2', status: TaskStatus.Completed, due_date: '2025-07-02' }
      ],
      total: 2,
      page: 1,
      pageSize: 10
    };

    taskServiceSpy.getTasks.and.returnValue(of(mockTasksResponse));

    await TestBed.configureTestingModule({
      imports: [
        TaskComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(taskServiceSpy.getTasks).toHaveBeenCalled();
  });
});