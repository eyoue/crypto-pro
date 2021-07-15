# E-sign
Либа работает в директиве.<br>
Это значит, что мы можем использовать ее как в HTML, так и в ts через ViewChild.<br>
В либе сервис для работы с плагином крипто-про.<br>
И директива для взаимеодействий с пользователем.

#Пример

HTML:
```
<button
  xmlESign
  (click)="openSignDialog()" <= your logic open dialog (with you layout)
  (successResult)="getSignedXML($event)" <= signed XML {payload, status}
  (failedResult)="getSignError($event)"> <= error sign {payload, status}
  Go
</button>
```

TS:
```
  openSignDialog() {
    const getDialogContext = (certificates: CertificateModel[]) => {
      return this.dialog.open(DialogComponent, {
        width: '800px',
        data: {
          title: 'Sign dialog',
          actionButton: {
            label: 'Sign',
            disabled: !this.xmlESign.selectedCertificate,
            selectionAction: (data: any) => {
              this.xmlESign.selectedCertificate = data;
            },
            clickAction: () => {
              this.xmlESign.sign();
            }
          },
          cancelButton: {
            label: 'Close',
          },
          listItems: certificates.map((cert) => ({
            data: cert,
            view: `
            <span>${cert.name}</span>
            <span>${cert.issuerName}</span>
            <span>${cert.validTo}</span>
            `
          }))
        }
      });
    }
    const getPreparedJson = () => {
      return {json: {data: 123}}
    }
    const certificates = this.xmlESign.getCertificates();
    const action = () => {
      this.xmlESign.jsonObject = getPreparedJson();
      certificates.pipe(tap(getDialogContext)).subscribe()
    }

    action()
  }
```

# Как использовать

<i>getDialogContext (...) </i> - Не относится к логике подписи. <br>
Это метод в котором я вызываю открытие окна с отображением сертификатов и <br>
прослушиваю события клика на кнопку и выбора в селекте (для вывода сертификатов). <br>
Компонент отображения может быть любым (верстка и логика вывода может быть любой).

То что нам нужно для подписи:

- Сертификат: <i>this.xmlESign.selectedCertificate</i>
    - Получаемый из списка: this.xmlESign.getCertificates()
- JSON объект, который будет приобразован в XML: <i>this.xmlESign.jsonObject = **</i>
- Метод, запускающий процесс подписи: <i>this.xmlESign.sign()</i>
- События, которые сообщат нам результат подписи или ошибку в формате <i>{payload, status}</i>
     - (successResult)
     - (failedResult)
     
 
 Если хотим отображать сертификаты - делаем компонент - выводим туда список<br>
 При выборе сертификата в списке - прокидываем его в директиву<br>
 Прокидываем в директиву наш JSON<br>
 Запускаем процесс подписи в директиве<br>
 Ловим результат - о него совершаем экшен (скачиваем, отправляем на бек и т.д.)<br>
