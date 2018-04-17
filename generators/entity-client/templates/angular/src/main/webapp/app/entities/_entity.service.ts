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
    let hasDate = false;
    if (fieldsContainInstant || fieldsContainZonedDateTime || fieldsContainLocalDate) {
        hasDate = true;
    }
_%>
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { SERVER_API_URL, FILE_UPLOAD_URL, STATIC_SERVER_URL } from '../../app.constants';
<%_ if (hasDate) { _%>

import { JhiDateUtils } from 'ng-jhipster';
<%_ } _%>

import { <%= entityAngularName %> } from './<%= entityFileName %>.model';
import { createRequestOption } from '../../shared';

export type EntityResponseType = HttpResponse<<%= entityAngularName %>>;

class FileCallbackModel {
    constructor(
        public fileUrl: string,
        public fileName?: string,
        public extensionName?: string,
        public key?: string
    ){ }
}

@Injectable()
export class <%= entityAngularName %>Service {

    private fileUploadUrl = FILE_UPLOAD_URL;
    private resourceUrl =  SERVER_API_URL + '<% if (applicationType === 'gateway' && locals.microserviceName) { %><%= microserviceName.toLowerCase() %>/<% } %>api/<%= entityApiUrl %>';
    <%_ if(searchEngine === 'elasticsearch') { _%>
    private resourceSearchUrl = SERVER_API_URL + '<% if (applicationType === 'gateway' && locals.microserviceName) { %><%= microserviceName.toLowerCase() %>/<% } %>api/_search/<%= entityApiUrl %>';
    <%_ } _%>
    constructor(private http: HttpClient<% if (hasDate) { %>, private dateUtils: JhiDateUtils<% } %>) { }
    <%_ if (entityAngularName.length <= 30) { _%>

    create(<%= entityInstance %>: <%= entityAngularName %>): Observable<EntityResponseType> {
    <%_ } else { _%>

    create(<%= entityInstance %>: <%= entityAngularName %>):
        Observable<EntityResponseType> {
    <%_ } _%>
        const copy = this.convert(<%= entityInstance %>);
        const filePostArr = [];
        let idx = 0;
        for (const key in copy) {
            const entityFileName = key.substring(0, key.indexOf('FileSource'));
            if (key.includes('FileSource') && copy[key]) {
                const formData = new FormData();
                if (copy[key] && copy[key].files) {
                    formData.append('file', copy[key].files[0]);
                    formData.append('key', entityFileName);
                    filePostArr[idx++] = this.http.post(this.fileUploadUrl, formData);
                }
            }
            if (key.includes('Base64Data')) {
                copy[key] = '';
            }

        }
        if (filePostArr.length <= 0) {
            return this.http.post<Test1>(this.resourceUrl, copy, { observe: 'response' })
                .map((res: EntityResponseType) => this.convertResponse(res));
        }
        return forkJoin(...filePostArr).concatMap((results: FileCallbackModel[]) => {
            results.forEach((element: FileCallbackModel) => {
                copy[element.key] = element.fileName;
                copy[element.key + 'Url'] = element.fileUrl;
            });
            return this.http.post<<%= entityAngularName %>>(this.resourceUrl, copy, { observe: 'response' });
        }).map((res: EntityResponseType) => this.convertResponse(res));
    }
    <%_ if (entityAngularName.length <= 30) { _%>

    update(<%= entityInstance %>: <%= entityAngularName %>): Observable<EntityResponseType> {
    <%_ } else { _%>

    update(<%= entityInstance %>: <%= entityAngularName %>):
        Observable<EntityResponseType> {
    <%_ } _%>
        const copy = this.convert(<%= entityInstance %>);

        const filePostArr = [];
        let idx = 0;
        const reg = /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/;
        for (const key in copy) {
            const entityFileName = key.substring(0, key.indexOf('FileSource'));
            if (key.includes('FileSource') && copy[key]) {
                const formData = new FormData();
                if (copy[key] && copy[key].files) {
                    formData.append('file', copy[key].files[0]);
                    formData.append('key', entityFileName);
                    filePostArr[idx++] = this.http.post(this.fileUploadUrl, formData);
                }
            }
            if (key.includes('Base64Data')) {
                copy[key] = '';
            }
            if (key.includes('Url') && copy[key]) {
                const exec = reg.exec(copy[key]);
                copy[key] = exec[5];
            }
        }
        if (filePostArr.length <= 0) {
            return this.http.put<<%= entityAngularName %>>(this.resourceUrl, copy, { observe: 'response' })
                .map((res: EntityResponseType) => this.convertResponse(res));
        }
        return forkJoin(...filePostArr).concatMap((results: FileCallbackModel[]) => {
            results.forEach((element: FileCallbackModel) => {
                copy[element.key] = element.fileName;
                copy[element.key + 'Url'] = element.fileUrl;
            });
            return this.http.put<<%= entityAngularName %>>(this.resourceUrl, copy, { observe: 'response' });
        }).map((res: EntityResponseType) => this.convertResponse(res));
    }

    find(id: <% if (pkType === 'String') { %>string<% } else { %>number<% } %>): Observable<EntityResponseType> {
        return this.http.get<<%= entityAngularName %>>(`${this.resourceUrl}/${id}`, { observe: 'response'})
            .map((res: EntityResponseType) => this.convertResponse(res));
    }

    query(req?: any): Observable<HttpResponse<<%= entityAngularName %>[]>> {
        const options = createRequestOption(req);
        return this.http.get<<%= entityAngularName %>[]>(this.resourceUrl, { params: options, observe: 'response' })
            .map((res: HttpResponse<<%= entityAngularName %>[]>) => this.convertArrayResponse(res));
    }

    delete(id: <% if (pkType === 'String') { %>string<% } else { %>number<% } %>): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response'});
    }
    <%_ if(searchEngine === 'elasticsearch') { _%>

    search(req?: any): Observable<HttpResponse<<%= entityAngularName %>[]>> {
        const options = createRequestOption(req);
        return this.http.get<<%= entityAngularName %>[]>(this.resourceSearchUrl, { params: options, observe: 'response' })
            .map((res: HttpResponse<<%= entityAngularName %>[]>) => this.convertArrayResponse(res));
    }
    <%_ } _%>

    private convertResponse(res: EntityResponseType): EntityResponseType {
        const body: <%= entityAngularName %> = this.convertItemFromServer(res.body);
        return res.clone({body});
    }

    private convertArrayResponse(res: HttpResponse<<%= entityAngularName %>[]>): HttpResponse<<%= entityAngularName %>[]> {
        const jsonResponse: <%= entityAngularName %>[] = res.body;
        const body: <%= entityAngularName %>[] = [];
        for (let i = 0; i < jsonResponse.length; i++) {
            body.push(this.convertItemFromServer(jsonResponse[i]));
        }
        return res.clone({body});
    }

    /**
     * Convert a returned JSON object to <%= entityAngularName %>.
     */
    private convertItemFromServer(<%= entityInstance %>: <%= entityAngularName %>): <%= entityAngularName %> {
        const copy: <%= entityAngularName %> = Object.assign({}, <%= entityInstance %>);
        <%_ for (idx in fields) { _%>
        <%_ if (fields[idx].fieldType === 'LocalDate') { _%>
        copy.<%=fields[idx].fieldName%> = this.dateUtils
            .convertLocalDateFromServer(<%= entityInstance %>.<%=fields[idx].fieldName%>);
        <%_ } _%>
        <%_ if (['Instant', 'ZonedDateTime'].includes(fields[idx].fieldType)) { _%>
        copy.<%=fields[idx].fieldName%> = this.dateUtils
            .convertDateTimeFromServer(<%= entityInstance %>.<%=fields[idx].fieldName%>);
            <%_ } _%>
        <%_ } _%>
        for (const key in copy) {
            if (key.includes('Url') && copy[key]) {
               copy[key] = STATIC_SERVER_URL + '/' + copy[key];
            }
        }
        return copy;
    }

    /**
     * Convert a <%= entityAngularName %> to a JSON which can be sent to the server.
     */
    private convert(<%= entityInstance %>: <%= entityAngularName %>): <%= entityAngularName %> {
        const copy: <%= entityAngularName %> = Object.assign({}, <%= entityInstance %>);
        <%_ for (idx in fields){ if (fields[idx].fieldType === 'LocalDate') { _%>
        copy.<%=fields[idx].fieldName%> = this.dateUtils
            .convertLocalDateToServer(<%= entityInstance %>.<%=fields[idx].fieldName%>);
        <%_ } if (['Instant', 'ZonedDateTime'].includes(fields[idx].fieldType)) { %>
        copy.<%=fields[idx].fieldName%> = this.dateUtils.toDate(<%= entityInstance %>.<%=fields[idx].fieldName%>);
        <%_ } } _%>
        return copy;
    }
}
