export default class MainController
{

    private accounts = [
        {
            name: "Checking accounts",
            icon: "fa-money",
            accounts: [
                {
                    name: "VISA Checking",
                    icon: "fa-cc-visa",
                    id: "****1234",
                    total: "$1234.00"
                },
                {
                    name: "VISA Checking",
                    icon: "fa-cc-visa",
                    id: "****4321",
                    total: "$4321.00"
                }
            ]
        },
        {
            name: "Saving accounts",
            icon: "fa-money",
            accounts: [
                {
                    name: "VISA Saving",
                    icon: "fa-cc-visa",
                    id: "****7890",
                    total: "$12,123.00"
                }
            ]
        },
        {
            name: "Credit card accounts",
            icon: "fa-money",
            accounts: [
                {
                    name: "MASTERCARD Space Travel Miles",
                    icon: "fa-cc-mastercard",
                    id: "****3145",
                    total: "($1,234.00)",
                    alert: "due " + new Date(new Date().getTime() + 10*24*60*60*100).toDateString()
                }
            ]
        },
        {
            name: "Investment accounts",
            icon: "fa-line-chart",
            accounts: [
                {
                    name: "10yr CD",
                    icon: "fa-dollar",
                    id: "****9876",
                    total: "54,234.00"
                },
                {
                    name: "5yr CD",
                    icon: "fa-dollar",
                    id: "****5352",
                    total: "4,234.00"
                }
            ]
        },
        {
            name: "Morgage accounts",
            icon: "fa-home",
            accounts: [
                {
                    name: "30yr Home morgage",
                    icon: "fa-home",
                    id: "***0123",
                    total: "654,321.00"
                }
            ]
        }
    ];

}
