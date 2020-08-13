const app = new Vue({
  el: '#app',
  data: {
    url: '',
    stamp: '',
    error: '',
    formVisible: true,
    created: null,
  },
  methods: {
    async createUrl() {
      this.error = '';

      const request = JSON.stringify({
        url: this.url,
        stamp: this.stamp || "",
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
        this.created = JSON.parse(result).qurl;
      } else {
        this.error = result.message;
      }
    },
  },
});
