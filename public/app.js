const app = new Vue({
    el: '#app',
    data: {
        url: '',
        stamp: '',
        usages: '',
        error: '',
        formVisible: true,
        link: null,
        usagesLeft: null,
    },
    methods: {
        async createUrl() {
            this.error = '';

            const request = JSON.stringify({
                url: this.url,
                stamp: this.stamp || "",
                usages: this.usages || 3
            })

            const response = await fetch('/api/urls', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: request,
            });

            const result = await response.json();

            console.log(result);
            if (response.ok) {
                this.formVisible = false;
                this.link = JSON.parse(result).qurl;
                this.usagesLeft = JSON.parse(result).usages;
            } else {
                this.error = result.message;
            }
        },
    },
});

function copyLink() {
    const copyText = document.getElementById("link");

    navigator.clipboard.writeText(copyText.textContent).then(() => {
        console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
        console.error('Async: Could not copy text: ', err);
    });
}
