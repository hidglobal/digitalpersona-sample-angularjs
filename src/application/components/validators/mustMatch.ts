import { IScope, IAttributes, IAugmentedJQuery, INgModelController } from 'angular';

export default function MustMatchDirective() {
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
            match: '=mustMatch',
        },
        link: (scope: IScope, elem: IAugmentedJQuery, attrs: IAttributes, ngModel: INgModelController) => {
            ngModel.$validators.mustMatch = (value: any) => {
                return value === scope["match"];
            };

            scope.$watch("match", () => {
                ngModel.$validate();
            });

            //    var modelValue = angular.isUndefined(model.$modelValue) ? model.$$invalidModelValue : model.$modelValue;
            //    return (model.$pristine && angular.isUndefined(modelValue)) || vm.match === modelValue;
            // }, function (currentValue) {
            //    debugger;
            //    model.$setValidity('match', currentValue);
            // });
        }
    };
}
