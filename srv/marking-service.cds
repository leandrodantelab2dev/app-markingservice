using { mrs.maintenance as db } from '../db/schema';

@requires: 'Fiscal'
service MarkingService {

  entity ServiceMarking as projection on db.ServiceMarking actions {
    action sendToPlanning();
    action reject(reason: String);
  };

  @readonly
  entity LineSection as projection on db.LineSection;

}
