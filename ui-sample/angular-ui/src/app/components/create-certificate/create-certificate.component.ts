import { Component, OnInit, ViewChild, ViewChildren, QueryList, OnChanges } from '@angular/core';
import { DataService } from '../../services/data/data.service';
import { ResourceService } from '../../services/resource/resource.service';
import { FormService } from '../../services/forms/form.service';
import { CertificateService } from '../../services/certificate/certificate.service';
import { DefaultTemplateComponent } from '../default-template/default-template.component';
import * as _ from 'lodash-es';
import urlConfig from '../../services/urlConfig.json';
import { CertReq, Store, Templates } from '../../services/interfaces/certificate';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-certificate',
  templateUrl: './create-certificate.component.html',
  styleUrls: ['./create-certificate.component.scss']
})
export class CreateCertificateComponent implements OnInit {

  @ViewChild('formData') formData: DefaultTemplateComponent;
  @ViewChildren('signatoryForm') signatoryFormData: QueryList<DefaultTemplateComponent>;
  @ViewChild('storageForm') storageFormData: DefaultTemplateComponent;
  dataService: DataService;
  formService: FormService;
  certificateService: CertificateService;
  resourceService: ResourceService;
  pdfUrl: string;
  public formFieldProperties: any;
  public storeFieldProperties: any;
  public signatoryFieldProperties: any;
  public req: CertReq;
  router: Router
  signatory: Array<Number> = [1];
  signatoryCount = 1;
  preview: boolean = false;
  storageInfo: boolean = false;
  storageDetails = {};
  templateActive: boolean;
  htmlTemplateId: string;
  listOfTemplate: Array<Templates> = [];
  id: number = 1;
  showAllCertsKeys = [];
  showAllCertsValues = [];
  certSelected = [];
  certificateSelected;
  constructor(dataService: DataService, formService: FormService, certificateService: CertificateService, resourceService: ResourceService, router: Router) {
    this.dataService = dataService;
    this.resourceService = resourceService;
    this.formService = formService;
    this.certificateService = certificateService;
    this.router = router;
  }

  ngOnInit() {
    this.templateActive = true;
    this.certificateService.getCertificateList().subscribe(res => {
      this.showAllCertsKeys = Object.keys(res.result);
      console.log(this.showAllCertsKeys);
      this.showAllCertsValues = Object.values(res.result);
      console.log(this.showAllCertsValues );
    });
    this.formService.getFormConfig("certificate").subscribe(res => {
      this.formFieldProperties = res.fields;
      console.log(this.formFieldProperties);
    });
    this.formService.getFormConfig("signatory").subscribe(res => {
      this.signatoryFieldProperties = res.fields;
    });
    this.formService.getFormConfig("store").subscribe(res => {
      this.storeFieldProperties = res.fields;
    });
    this.getTemplates();
  }


  getTemplates() {

    const template = {
      id: "temp1",
      name: "/assets/certificates/template-1.svg"
    }
    this.listOfTemplate.push(template);
  }
  createCertificate() {
    const certificateData = this.generateData(_.pickBy(this.formData.formInputData));
    const requestData = {
      data: {
        params: {},
        request: {
          certificate: certificateData
        }
      },
      url: urlConfig.URLS.GENERTATE_CERT
    };
    this.dataService.post(requestData).subscribe(res => {
      console.log('certificate generated successfully', res)
      this.pdfUrl = res.result.response[0].pdfUrl;
      if (this.pdfUrl.startsWith("http")) {
        window.open(this.pdfUrl, '_blank');
      } else {
        this.dowloadPdf();
      }
    });
  }
  /**
   *
   * @param request
   */
  generateData(request: any) {
    const signatoryList = [];
    const requestData = _.cloneDeep(request);
    var certificate = {
      data: [],
      issuer: {},
      signatoryList: [],
      htmlTemplateId: '',
      svgTemplateId: '',
      courseName: '',
      location: '',
      courseGrade: '',
      name: '',
      description: '',
      certificateNum: '',
      studentRegNo: '',

    };
    const data = [{
      recipientName: requestData.recipientName,
      recipientEmail: requestData.recipientEmail,
      recipientPhone: requestData.recipientPhone,
    }];
    const issuer = {
      name: requestData.name,
      url: requestData.url,
    }
    this.signatoryFormData.forEach(issuer => {
      signatoryList.push(issuer.formInputData);
    });
    if (this.storageInfo) {
      certificate['storeConfig'] = this.getStorageDetail();
    }
    certificate.data = data;
    certificate.issuer = issuer;
    certificate.signatoryList = signatoryList;
    // certificate.htmlTemplate = this.htmlTemplate;
    certificate.htmlTemplateId = this.showAllCertsKeys[this.certificateSelected];
    certificate.svgTemplateId = this.showAllCertsKeys[this.certificateSelected];
    certificate.courseName = requestData.courseName;
    certificate.location = requestData.courseLocation;
    certificate.courseGrade = requestData.courseGrade;
    certificate.name = requestData.certificateName;
    certificate.description = requestData.certificateDescription;
    certificate.certificateNum = requestData.certificateNumber;
    certificate.studentRegNo = requestData.recipientRegistrationNumber;

    if (this.preview) {
      certificate['preview'] = "true";
      this.preview = false;
    }
    return certificate;
  }
  getStorageDetail() {
    this.storageDetails = _.pickBy(this.storageFormData.formInputData);
    const account = {
      account: '',
      key: '',
      path: '',
      containerName: ''
    }
    const storeConfig = {
      type: ''
    };
    const type = this.storageDetails['type'];
    storeConfig.type = type;
    account.account = this.storageDetails['account'];
    account.key = this.storageDetails['key'];
    account.containerName = this.storageDetails['containerName'];
    account.path = this.storageDetails['path'];
    storeConfig[type] = account;
    return storeConfig;
  }
  addSignatory() {
    this.signatory.push(this.signatoryCount++)
  }
  dowloadPdf() {
    const requestData = {
      data: {
        params: {},
        request: {
          pdfUrl: this.pdfUrl
        }
      },
      url: urlConfig.URLS.DOWLOAD_PDF
    }
    this.dataService.post(requestData).subscribe(res => {
      window.open(res.result.signedUrl, '_blank');
      this.router.navigate(['']);
    });
  }
  removeSignatory() {
    if (this.signatory.length > 1) {
      this.signatory
    }
    if (this.signatoryCount > 1) {
      this.signatory.pop()
      this.signatoryCount--;
    }
  }
  previewCertificate() {
    this.preview = true;
    this.createCertificate();
  }

  selectedSvgCert(event) {
    event.stopPropagation();
    if (this.certSelected.length > 0) {
      if (this.certSelected[0] !== event.target.id) {
        if (!event.target.classList.contains('svg__icon--active')) {
          document.getElementById(this.certSelected[0]).classList.remove('svg__icon--active');
          event.target.classList.add('svg__icon--active');
          this.certSelected.pop();
          this.certSelected.push(event.target.id);
          this.certificateSelected = this.showAllCertsValues.indexOf(event.target.id);
        }
      } else {
        event.target.classList.remove('svg__icon--active');
        this.certSelected.pop();
        this.certificateSelected = '';
      }
    } else {
      if (!event.target.classList.contains('svg__icon--active')) {
        event.target.classList.add('svg__icon--active');
        this.certSelected.push(event.target.id);
        this.certificateSelected = this.showAllCertsValues.indexOf(event.target.id);
      }
    }
    console.log(this.certSelected);
    console.log(this.showAllCertsKeys[this.certificateSelected]);
  }
}