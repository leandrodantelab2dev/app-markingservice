using { cuid, managed, sap.common.CodeList } from '@sap/cds/common';

namespace mrs.maintenance;

entity LineSection : cuid, managed {
  code        : String(20)  not null;
  description : String(200) not null;
  line        : String(50)  not null;
  subdivision : String(50);
  kmStart     : Decimal(9,3) not null;
  kmEnd       : Decimal(9,3) not null;
}

entity ServiceMarking : cuid, managed {
  lineSection : Association to LineSection not null;
  kmFrom      : Decimal(9,3) not null;
  kmTo        : Decimal(9,3) not null;
  latitude    : Decimal(9,6) not null;
  longitude   : Decimal(9,6) not null;
  markingDate : DateTime not null;
  inspector   : String(100) not null;
  serviceType : Association to ServiceType not null;
  condition   : Association to Condition not null;
  status      : Association to MarkingStatus not null default 'MARKED';
  notes       : String(1000);
  photos      : Composition of many Attachment on photos.marking = $self;
}

entity Attachment : cuid {
  marking   : Association to ServiceMarking;
  fileName  : String(255) not null;
  mediaType : String(100) not null;
  url       : String(500) not null;
}

entity ServiceType : CodeList {
  key code : String(40);
}

entity Condition : CodeList {
  key code : String(20);
}

entity MarkingStatus : CodeList {
  key code : String(20);
}
