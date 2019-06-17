# kube-ldap-client-go-exec-plugin
[![Build Status](https://travis-ci.org/gyselroth/kube-ldap-client-go-exec-plugin.svg)](https://travis-ci.org/gyselroth/kube-ldap-client-go-exec-plugin)
 [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A [client-go credentials plugin](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#client-go-credential-plugins) for [kube-ldap](https://github.com/gyselroth/kube-ldap), written in javascript.

## Description
The kube-ldap-client-go-exec-plugin can be used to integrate kube-ldap-authentication in your kubectl.
Whenever kubectl is invoked with a context configured to use this plugin, the plugin asks for username and password to get a kube-ldap-token and stores this token together with the tokens expiry date.
On subsequent invocations of kubectl the cached token is used unless the token is expired or rejected by the kubernetes apiserver (in which case it asks for username and password again).

## Installation
Download the latest version of this plugin from the [releases page](https://github.com/gyselroth/kube-ldap-client-go-exec-plugin/releases) for your OS, rename it to `kube-ldap-client-go-exec-plugin` and place it in an executable path for your OS.
E.g.:
- Linux/OS X: `/usr/local/bin`
- Windows: `c:\windows\system32`

## Configuration
To make use of this plugin, alter the credentials of your context in your kubeconfig to use this plugin for authentication together with the corresponding url to your kube-ldap installation.
E.g.:
```yaml
[...]
users:
- name: your-cluster-kube-ldap
  user:
    exec:
      command: kube-ldap-client-go-exec-plugin
      args:
      - "https://your-kube-ldap-url"
      apiVersion: "client.authentication.k8s.io/v1alpha1"
```
