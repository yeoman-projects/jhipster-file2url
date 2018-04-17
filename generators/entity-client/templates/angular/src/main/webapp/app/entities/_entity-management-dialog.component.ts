<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
<%_
const i18nToLoad = [entityInstance];
for (const idx in fields) {
    if (fields[idx].fieldIsEnum === true) {
        i18nToLoad.push(fields[idx].enumInstance);
    }
}
const query = generateEntityQueries(relationships, entityInstance, dto);
const queries = query.queries;
const variables = query.variables;
let hasManyToMany = query.hasManyToMany;
_%>
import { Component, OnInit, OnDestroy<% if (fieldsContainImageBlob) { %>, ElementRef<% } %> } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager<% if (queries && queries.length > 0) { %>, JhiAlertService<% } %><% if (fieldsContainBlob) { %>, JhiDataUtils<% } %> } from 'ng-jhipster';

import { <%= entityAngularName %> } from './<%= entityFileName %>.model';
import { <%= entityAngularName %>PopupService } from './<%= entityFileName %>-popup.service';
import { <%= entityAngularName %>Service } from './<%= entityFileName %>.service';
<%_
let hasRelationshipQuery = false;
Object.keys(differentRelationships).forEach(key => {
    const hasAnyRelationshipQuery = differentRelationships[key].some(rel =>
        (rel.relationshipType === 'one-to-one' && rel.ownerSide === true && rel.otherEntityName !== 'user')
            || rel.relationshipType !== 'one-to-many'
    );
    if (hasAnyRelationshipQuery) {
        hasRelationshipQuery = true;
    }
    if (differentRelationships[key].some(rel => rel.relationshipType !== 'one-to-many')) {
        const uniqueRel = differentRelationships[key][0];
        if (uniqueRel.otherEntityAngularName !== entityAngularName) {
_%>
import { <%= uniqueRel.otherEntityAngularName %>, <%= uniqueRel.otherEntityAngularName%>Service } from '../<%= uniqueRel.otherEntityModulePath %>';
<%_     }
    }
}); _%>

@Component({
    selector: '<%= jhiPrefixDashed %>-<%= entityFileName %>-dialog',
    templateUrl: './<%= entityFileName %>-dialog.component.html'
})
export class <%= entityAngularName %>DialogComponent implements OnInit {

    <%= entityInstance %>: <%= entityAngularName %>;
    isSaving: boolean;
    <%_
    for (const idx in variables) { %>
    <%- variables[idx] %>
    <%_ } _%>
    <%_ for (idx in fields) {
        const fieldName = fields[idx].fieldName;
        const fieldType = fields[idx].fieldType;
        if (fieldType === 'LocalDate') { _%>
    <%= fieldName %>Dp: any;
        <%_ }
    } _%>

    constructor(
        public activeModal: NgbActiveModal,
        <%_ if (fieldsContainBlob) { _%>
        private dataUtils: JhiDataUtils,
        <%_ } _%>
        <%_ if (queries && queries.length > 0) { _%>
        private jhiAlertService: JhiAlertService,
        <%_ } _%>
        private <%= entityInstance %>Service: <%= entityAngularName %>Service,
        <%_ Object.keys(differentRelationships).forEach(key => {
            if (differentRelationships[key].some(rel => rel.relationshipType !== 'one-to-many')) {
                const uniqueRel = differentRelationships[key][0];
                if (uniqueRel.otherEntityAngularName !== entityAngularName) { _%>
        private <%= uniqueRel.otherEntityName %>Service: <%= uniqueRel.otherEntityAngularName %>Service,
        <%_
                }
            }
        }); _%>
        <%_ if (fieldsContainImageBlob) { _%>
        private elementRef: ElementRef,
        <%_ } _%>
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        <%_ for (idx in queries) { _%>
        <%- queries[idx] %>
        <%_ } _%>
    }

    <%_ if (fieldsContainBlob) { _%>
    byteSize(field) {
        return ;
        // return this.dataUtils.byteSize(field);
    }

    openFile(contentType, field) {
        if (field.includes('http')) {
            const win = window.open();
            win.document.write(`<iframe src="${field}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
            return;
        }
        return this.dataUtils.openFile(contentType, field);
    }

    setFileData(event, entity, field, isImage) {
        this.<%= entityInstance %>[field + 'FileSource'] = event.target;
        this.<%= entityInstance %>[field + 'ContentType'] = event.target.files[0].type;
        this.<%= entityInstance %>[field] = event.target.files[0].name;
        field = field + 'Base64Data';
        this.dataUtils.setFileData(event, entity, field, isImage);
    }

    <%_ if (fieldsContainImageBlob) { _%>
    clearInputImage(field: string, fieldContentType: string, idInput: string) {
        this.dataUtils.clearInputImage(this.<%= entityInstance %>, this.elementRef, field, fieldContentType, idInput);
    }

    <%_ } _%>
    <%_ } _%>
    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;
        if (this.<%= entityInstance %>.id !== undefined) {
            this.subscribeToSaveResponse(
                this.<%= entityInstance %>Service.update(this.<%= entityInstance %>));
        } else {
            this.subscribeToSaveResponse(
                this.<%= entityInstance %>Service.create(this.<%= entityInstance %>));
        }
    }

    private subscribeToSaveResponse(result: Observable<HttpResponse<<%= entityAngularName %>>>) {
        result.subscribe((res: HttpResponse<<%= entityAngularName %>>) =>
            this.onSaveSuccess(res.body), (res: HttpErrorResponse) => this.onSaveError());
    }

    private onSaveSuccess(result: <%= entityAngularName %>) {
        this.eventManager.broadcast({ name: '<%= entityInstance %>ListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError() {
        this.isSaving = false;
    }
    <%_ if (queries && queries.length > 0) { _%>

    private onError(error: any) {
        this.jhiAlertService.error(error.message, null, null);
    }
    <%_ } _%>
    <%_
    const entitiesSeen = [];
    for (idx in relationships) {
        const otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized;
        if(relationships[idx].relationshipType !== 'one-to-many' && !entitiesSeen.includes(otherEntityNameCapitalized)) {
    _%>

    track<%- otherEntityNameCapitalized -%>ById(index: number, item: <%- relationships[idx].otherEntityAngularName -%>) {
        return item.id;
    }
    <%_ entitiesSeen.push(otherEntityNameCapitalized); } } _%>
    <%_ if (hasManyToMany) { _%>

    getSelected(selectedVals: Array<any>, option: any) {
        if (selectedVals) {
            for (let i = 0; i < selectedVals.length; i++) {
                if (option.id === selectedVals[i].id) {
                    return selectedVals[i];
                }
            }
        }
        return option;
    }
    <%_ } _%>
}

@Component({
    selector: '<%= jhiPrefixDashed %>-<%= entityFileName %>-popup',
    template: ''
})
export class <%= entityAngularName %>PopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private <%= entityInstance %>PopupService: <%= entityAngularName %>PopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.<%= entityInstance %>PopupService
                    .open(<%= entityAngularName %>DialogComponent as Component, params['id']);
            } else {
                this.<%= entityInstance %>PopupService
                    .open(<%= entityAngularName %>DialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
