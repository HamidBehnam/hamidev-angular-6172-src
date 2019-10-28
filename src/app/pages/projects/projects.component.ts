import {Component, OnInit} from '@angular/core';
import {ProjectsListComponent} from './projects-list/projects-list.component';
import {Observable} from 'rxjs';
import {Project} from '../../store/projects-store/models/project';
import {ProjectsFacadeService} from '../../store/projects-store/services/projects-facade.service';
import {ProjectDetailComponent} from './project-detail/project-detail.component';
import {ProjectMeta} from "./utils/interfaces/project-meta";
import {ProjectCreatorComponent} from './project-creator/project-creator.component';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  projects$: Observable<Project[]>;
  selectedProjectsIds$: Observable<string[]>;
  currentProject$: Observable<Project>;

  constructor(private projectsFacadeService: ProjectsFacadeService) {}

  ngOnInit() {
    this.initializationCore();
    this.loadProjects();
  }

  // the reason for providing this initialization function is because the moment that we need to set the internal route's data
  // is NOT necessarily AFTER running the current component's ngOnInit
  // alternatively we could put this initialization stuff in the constructor or as a value for the class property but it
  // doesn't make sense because the initialization code could be complicated
  // which is not suitable to be places in the constructor or as a value for the class property
  initializationCore() {
    this.projects$ = this.projectsFacadeService.projects$;
    this.selectedProjectsIds$ = this.projectsFacadeService.selectedProjectsIds$;
    this.currentProject$ = this.projectsFacadeService.currentProject$;
  }

  loadProjects() {
    this.projectsFacadeService.loadProjects();
  }

  selectProjectsIds(projectIds: string[]) {
    this.projectsFacadeService.selectProjectsIds(projectIds);
  }

  loadProject(projectId: string) {
    this.projectsFacadeService.loadProject(projectId);
  }

  updateProject(projectMeta: ProjectMeta) {
    this.projectsFacadeService.updateProject(projectMeta.project, projectMeta.callbacks);
  }

  createProject(projectMeta: ProjectMeta) {
    this.projectsFacadeService.createProject(projectMeta.project, projectMeta.callbacks);
  }

  onActivated(componentReference: any) {
    this.initializationCore();

    if (componentReference instanceof ProjectsListComponent) {
      componentReference.projects$ = this.projects$;
    } else if (componentReference instanceof ProjectDetailComponent) {
      componentReference.project$ = this.currentProject$;
      componentReference.projectId.subscribe(projectId => {
        this.selectProjectsIds([projectId]);
        this.loadProject(projectId);
      });
      componentReference.projectUpdated.subscribe((projectMeta: ProjectMeta) =>
        this.updateProject(projectMeta));
    } else if (componentReference instanceof ProjectCreatorComponent) {
      componentReference.projectCreated.subscribe((projectMeta: ProjectMeta) =>
        this.createProject(projectMeta));
    }
  }
}
